class TabsView {
    tabs
    elementWrapper
    element
    editor
    tabNodes = new Map()
    nodeAddTab

    constructor(tabs, elementWrapper, editor) {
        this.tabs = tabs
        this.elementWrapper = elementWrapper
        this.element = elementWrapper.getElementsByClassName('tabs')[0]
        this.editor = editor
        this.scroller = new Scroller(this.element)

        this.element.addEventListener('wheel', (event) => {
            if (event.deltaY) {
                event.preventDefault();
                event.stopPropagation();
                this.scroller.scrollTo(event.deltaY, 0, 60)
            }
        });

        window.addEventListener('resize', (event) => {
            if (!this.isActiveTabInView()) {
                this.moveActiveTabToView()
            }
        })
    }

    render() {
        if (!this.nodeAddTab) {
            var nodeAddTab = document.createElement('a')
            nodeAddTab.setAttribute('href', '#')
            nodeAddTab.className = 'tab plus'
            nodeAddTab.appendChild(document.createTextNode('+'))

            nodeAddTab.addEventListener('click', (e) => {
                e.preventDefault()

                var newTab = new Tab(this.tabs.getTabs().length + 1)
                this.tabs.addTab(newTab)
                this.setActiveTab(newTab)

                this.render()
                if (!this.isActiveTabInView()) {
                    this.moveActiveTabToView()
                }
            })

            this.nodeAddTab = nodeAddTab
            this.elementWrapper.appendChild(nodeAddTab)
        }

        var activeTab = this.tabs.getActiveTab()
        var tabs = this.tabs.getTabs()

        this.element.innerHtml = ''

        for (var index in tabs) {
            var tab = tabs[index]
            var tabNode = this.renderTab(tab, tab == activeTab)
            //this.element.insertBefore(tabNode, this.nodeAddTab)
            this.element.appendChild(tabNode)
        }
    }

    renderTab(tab, isActive) {
        // update node if already exists
        let n = this.tabNodes.get(tab)
        if (n) {
            this.updateTab(n, tab, isActive)
            return n
        }

        // create node
        n = document.createElement('a')
        n.setAttribute('href', '#')
        n.addEventListener('click', (e) => {
            e.preventDefault()
            this.setActiveTab(tab)
            this.render()
        })

        let classNames = ['tab']
        if (isActive) {
            classNames.push('active')
        }

        n.className = classNames.join(' ')
        n.appendChild(document.createTextNode(tab.getTitle()))

        const nClose = document.createElement('a')
        nClose.setAttribute('href', '#')
        nClose.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            
            if (this.tabs.removeTab(tab)) {
                this.tabNodes.delete(tab)
                n.parentNode.removeChild(n)
                this.setActiveTab(this.tabs.getActiveTab())
            }
            this.render()
        })
        nClose.appendChild(document.createTextNode('x'))
        nClose.className = 'tab-close'
        n.appendChild(nClose)

        this.tabNodes.set(tab, n)

        return n
    }

    updateTab(node, tab, isActive) {
        var classNames = ['tab']
        if (isActive) {
            classNames.push('active')
        }
        node.className = classNames.join(' ')
    }

    setActiveTab(tab) {
        // remember editor scroll position (relative values)
        var scrollInfo = this.editor.getScrollInfo()
        var activeTab = this.tabs.getActiveTab()
        activeTab.setScrollPosition(
            scrollInfo.width ? scrollInfo.left / scrollInfo.width : 0,
            scrollInfo.height ? scrollInfo.top / scrollInfo.height : 0
        )

        this.tabs.setActiveTab(tab)

        this.setContent(tab.getContent())
        this.setFoldedLines(tab.getFoldedLines())
        this.setScrollPos(tab.getScrollPosition())
    }

    setContent(content) {
        this.editor.setValue(content)
    }

    setScrollPos(scrollPos) {
        var scrollInfo = this.editor.getScrollInfo();
        this.editor.scrollTo(
            scrollInfo.width * scrollPos.left,
            scrollInfo.height * scrollPos.top
        )
    }

    setFoldedLines(foldedLines) {
        foldedLines.forEach((lineNumber) => {
            this.editor.foldCode(CodeMirror.Pos(lineNumber, 0))
        })
    }

    onChange(newContent) {
        this.tabs.getActiveTab().setContent(newContent)
    }

    onFoldChange(lineFoldedUnfolded) {
        this.tabs.getActiveTab().onFoldChange(lineFoldedUnfolded)
    }

    isActiveTabInView() {
        if (this.tabNodes.size < 2) {
            return
        }
        const node = this.getActiveTabNode()
        if (node) {
            return this.isInView(node, node.parentNode)
        }

        return true
    }

    getActiveTabNode() {
        for (const [key, node] of this.tabNodes) {
            if (node.classList.contains('active')) {
                return node
            }
        }
        return null
    }

    moveActiveTabToView() {
        this.scroller.stop()
        const node = this.getActiveTabNode()
        if (node) {
            node.parentNode.scrollLeft = node.offsetLeft
        }
    }

    isInView(childNode, parentNode) {
        const parentRight = parentNode.scrollLeft + parentNode.clientWidth;
        const childRight = childNode.offsetLeft + childNode.offsetWidth;

        return (
            childNode.offsetLeft >= parentNode.scrollLeft
            && childRight <= parentRight
        );
    }
}
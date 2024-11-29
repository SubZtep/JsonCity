class TabsView {
    tabs
    elementWrapper
    editor

    element
    tabNodes = new Map()
    nodeAddTab

    isSwitchingTab = false

    constructor(tabs, elementWrapper, editor) {
        this.tabs = tabs
        this.elementWrapper = elementWrapper
        this.editor = editor

        this.element = elementWrapper.getElementsByClassName('tabs')[0]
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
            const nodeAddTab = document.createElement('a')
            nodeAddTab.setAttribute('href', '#')
            nodeAddTab.className = 'tab plus'
            nodeAddTab.appendChild(document.createTextNode('+'))

            nodeAddTab.addEventListener('click', (e) => {
                e.preventDefault()

                this.addTab()
            })

            this.nodeAddTab = nodeAddTab
            this.elementWrapper.appendChild(nodeAddTab)
        }

        const activeTab = this.tabs.getActiveTab()
        const tabs = this.tabs.getTabs()

        this.element.innerHtml = ''

        for (const index in tabs) {
            const tab = tabs[index]
            const tabNode = this.renderTab(tab, tab == activeTab)
            this.element.appendChild(tabNode)
        }
    }

    addTab() {
        const tabs = this.tabs.getTabs()
        let title = tabs.length + 1
        for (const index in tabs) {
            const tab = tabs[index]
            const titleIntValue = parseInt(tab.title)
            if (titleIntValue >= title && titleIntValue == tab.title) {
                title = titleIntValue + 1
            }
        }
        const newTab = new Tab(title)
        this.tabs.addTab(newTab)
        this.setActiveTab(newTab)

        this.render()
        if (!this.isActiveTabInView()) {
            this.moveActiveTabToView()
        }

        this.editor.syncState()
    }

    renderTab(tab, isActive) {
        // update node if already exists
        let tabNodes = this.tabNodes.get(tab)
        if (tabNodes) {
            this.updateTab(tabNodes, tab, isActive)
            return tabNodes.node
        }

        // create node
        const textNode = document.createTextNode(tab.getTitle())
        const n = document.createElement('a')
        n.setAttribute('href', '#')
        n.addEventListener('click', (e) => {
            e.preventDefault()
            this.setActiveTab(tab)
            this.render()
        })
        n.addEventListener('dblclick', (e) => {
            e.preventDefault()
            const title = prompt('Enter new title of this tab', tab.title)
            if (title) {
                tab.title = title
                textNode.textContent = title
                this.editor.syncState()
            }
        })

        let classNames = ['tab']
        if (isActive) {
            classNames.push('active')
        }

        n.className = classNames.join(' ')

        const nTitle = document.createElement('span')
        nTitle.className = 'title'
        nTitle.appendChild(textNode)

        n.appendChild(nTitle)

        const nClose = document.createElement('a')
        nClose.setAttribute('href', '#')
        nClose.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            
            this.removeTab(tab)
            this.render()
        })
        nClose.appendChild(document.createTextNode('x'))
        nClose.className = 'tab-close'
        n.appendChild(nClose)

        this.tabNodes.set(tab, {
            node: n,
            titleTextNode: textNode
        })

        return n
    }

    removeTab(tab) {
        const tabNodes = this.tabNodes.get(tab)
        if (this.tabs.removeTab(tab, true)) {
            this.tabNodes.delete(tab)
            if (tabNodes) {
                tabNodes.node.parentNode.removeChild(tabNodes.node)
            }
            this.setActiveTab(this.tabs.getActiveTab())
        }

        this.editor.syncState()
    }

    syncRemoveTab(tab) {
        const tabNodes = this.tabNodes.get(tab)
        if (this.tabs.removeTab(tab, false)) {
            this.tabNodes.delete(tab)
            if (tabNodes) {
                tabNodes.node.parentNode.removeChild(tabNodes.node)
            }
            this.setActiveTab(this.tabs.getActiveTab())
        }
    }

    updateTab(tabNodes, tab, isActive) {
        const classNames = ['tab']
        if (isActive) {
            classNames.push('active')
        }
        tabNodes.node.className = classNames.join(' ')
        tabNodes.titleTextNode.textContent = tab.title
    }

    setActiveTab(tab) {
        this.isSwitchingTab = true
        try {
            // remember editor scroll position (relative values)
            const cmEditor = this.editor.editor
            const scrollInfo = cmEditor.getScrollInfo()
            const activeTab = this.tabs.getActiveTab()
            activeTab.setScrollPosition(
                scrollInfo.width ? scrollInfo.left / scrollInfo.width : 0,
                scrollInfo.height ? scrollInfo.top / scrollInfo.height : 0
            )

            this.tabs.setActiveTab(tab)
            cmEditor.setValue(tab.getContent())
            this.editor.setFoldedLines(tab.getFoldedLines())
            this.editor.setScrollPos(tab.getScrollPosition())
        } catch (e) {
            console.error(e)
        } finally {
            this.isSwitchingTab = false
        }
    }

    isActiveTabInView() {
        if (this.tabNodes.size < 2) {
            return
        }
        const node = this.getActiveTabNode()
        if (node && node.parentNode) {
            return this.isInView(node, node.parentNode)
        }

        return true
    }

    getActiveTabNode() {
        for (const [key, textNode] of this.tabNodes) {
            if (textNode.node.classList.contains('active')) {
                return textNode
            }
        }
        return null
    }

    moveActiveTabToView() {
        this.scroller.stop()
        const textNode = this.getActiveTabNode()
        if (textNode) {
            textNode.node.parentNode.scrollLeft = node.offsetLeft
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
class JsonCitySync {
	instanceId
	channel
	localStorageEnabled
	windowSyncEnabled

	constructor(instanceId, element, localStorageEnabled, windowSyncEnabled) {
		this.instanceId = instanceId
		this.element = element
		this.localStorageEnabled = localStorageEnabled
		this.windowSyncEnabled = windowSyncEnabled

		if (this.localStorageEnabled) {
			this.localStorageKey = 'json_city_' + instanceId
		}

		if (this.windowSyncEnabled) {
			// create broadcast channel to communicate real-time between browser windows and tabs
			this.channel = new BroadcastChannel('json_city')
			this.channel.onmessage = (e) => { this.onMessage(e) }
		}
	}

	onMessage(event) {
		if (event.data.id == 'stateUpdate') {
			const e = new CustomEvent(JsonCityEditor.EVENT_PREFIX + JsonCityEditor.EVENT_SYNC_STATE_UPDATE, {
				detail: event.data.data,
				bubbles: false,    // Do not allow the event to bubble up the DOM
				cancelable: false  // Do not allow listeners to cancel the event
			})
	
			this.element.dispatchEvent(e)
		}
	}

	getStateFromLocalStorage() {
		if (!this.localStorageEnabled) {
			return null
		}

		const state = localStorage.getItem(this.localStorageKey)
		if (!state) {
			return null
		}
		const stateObj = JSON.parse(state)
		if (stateObj.version != 1) {
			console.error('unknown state version: ' + stateObj.version, state)
		}
		return stateObj.data
	}

	updateState(state, storeInLocalStorage) {
		// this will store the state in local storage and also will notify other browser windows via channel
		// fot his one let's version it
		const stateData = {
			version: 1,
			data: state
		}

		if (this.localStorageEnabled && storeInLocalStorage) {
			const stateDataString = JSON.stringify(stateData)
			localStorage.setItem(this.localStorageKey, stateDataString);
		}

		if (this.windowSyncEnabled) {
			this.channel.postMessage({
				id: 'stateUpdate',
				data: stateData
			})
		}
	}
}

class JsonCityEditor {
    static EVENT_PREFIX = 'json_city:'
    static EVENT_COMPRESS = 'compress'
    static EVENT_DECOMPRESS = 'decompress'
    static EVENT_EDITOR_CONTENT_CHANGE = 'editorContentChange'
    static EVENT_EDITOR_GUTTER_CLICK = 'editorGutterClick'
    static EVENT_SYNC_STATE_UPDATE = 'syncStateUpdate'

    instanceId // in case you want multple editors on one page
    element
    sync
    editor
    tabsView
    tabs

    elementEditor
    elementTabWrapper
    elementTabs

    initialising = false

    allUuidsFromNewState = [] // updates can happen often and we don't want to create new array each time

    constructor(instanceId, element, sync) {
        this.instanceId = instanceId
        this.element = element
        this.sync = sync
    }

    init() {
        this.initialising = true

        this.initDom() // create main HTML for tabs and editor
        this.initEditor() // the editor
        this.initEventListeners() // listen to events
        this.initTabs()

        this.initState() // initialize from state stored in local storage

        this.tabsView.render()

        this.initialising = false
        this.syncingState = false
    }

    initDom() {
        this.elementTabWrapper = document.createElement('div')
        this.elementTabWrapper.className = 'tab-wrapper'

        this.elementTabs = document.createElement('div')
        this.elementTabs.className = 'tabs'

        this.elementEditor = document.createElement('textarea')
        this.elementEditor.setAttribute('id', 'json_input')

        this.elementTabWrapper.appendChild(this.elementTabs)

        this.element.appendChild(this.elementTabWrapper)
        this.element.appendChild(this.elementEditor)
    }

    initEditor() {
        this.editor = CodeMirror.fromTextArea(this.elementEditor, {
            lineNumbers: true,
            //mode: "javascript",
            //mode: "application/ld+json",
            mode: "application/json",
            theme: "blackboard",
            matchBrackets: true,
            extraKeys: {
                "Ctrl-Q": function(cm) { cm.foldCode(cm.getCursor()); },
                "Alt-F": "findPersistent"
            },
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        })

        this.editor.on("change", (cm, changeObj) => {
            this.dispatchEvent(JsonCityEditor.EVENT_EDITOR_CONTENT_CHANGE, this.editor.getValue())
        })

        // Add a listener for gutter clicks (on code folding expand / contract)
        this.editor.on('gutterClick', (cm, line, gutter, event) => {
            if (gutter === "CodeMirror-foldgutter") {
                this.dispatchEvent(JsonCityEditor.EVENT_EDITOR_FOLD_CHANGE, line)
            }
        })

    }

    initEventListeners() {
        // sync
        window.addEventListener("beforeunload", () => {
            this.syncState()
        })

        // internal events
        this.element.addEventListener(JsonCityEditor.EVENT_PREFIX + JsonCityEditor.EVENT_COMPRESS, (e) => { this.onCompress(true) })
        this.element.addEventListener(JsonCityEditor.EVENT_PREFIX + JsonCityEditor.EVENT_DECOMPRESS, (e) => { this.onCompress(false) })
        this.element.addEventListener(JsonCityEditor.EVENT_PREFIX + JsonCityEditor.EVENT_EDITOR_CONTENT_CHANGE, (e) => { this.onContentChange(e.detail) })
        this.element.addEventListener(JsonCityEditor.EVENT_PREFIX + JsonCityEditor.EVENT_EDITOR_FOLD_CHANGE, (e) => { this.onFoldChange(e.detail) })

        this.element.addEventListener(JsonCityEditor.EVENT_PREFIX + JsonCityEditor.EVENT_SYNC_STATE_UPDATE, (e) => { this.onSyncState(e.detail) })
    }

    initTabs() {
        this.tabs = new Tabs()
        this.tabsView = new TabsView(this.tabs, this.elementTabWrapper, this)
        this.tabsView.render()
    }

    initState() {
        const initialState = this.sync.getStateFromLocalStorage(this.sync.localStorageKey)

        if (initialState && initialState?.tabs?.length > 0) {
            // restore
            for (const i in initialState.tabs) {
                const tabState = initialState.tabs[i]
                const tab = this.tabs.createTabFromState(tabState)
                this.tabs.addTab(tab)

                if (i == 0) {
                    this.editor.setValue(tab.content)
                    this.tabs.setActiveTab(tab)
                    this.setFoldedLines(tab.foldedLines)
                }
            }
        } else {
            // create first initial tab
            const newTab = new Tab(1)
            this.tabs.addTab(newTab)
            this.tabs.setActiveTab(newTab)
        }
    }

    dispatchEvent(eventId, data) {
        const event = new CustomEvent(JsonCityEditor.EVENT_PREFIX + eventId, {
            detail: data,
            bubbles: false,    // Do not allow the event to bubble up the DOM
            cancelable: false  // Do not allow listeners to cancel the event
        })

        this.element.dispatchEvent(event)
    }

    onCompress(compress) {
        try {
            const jsonVal = this.editor.getValue();
            if (!jsonVal) {
                return
            }

            jsl.parser.parse(jsonVal)

            const emptyFoldedLines = []
            this.tabs.getActiveTab().foldedLines = emptyFoldedLines
            this.setFoldedLines(emptyFoldedLines)

            if (compress) {
                this.editor.setValue(JSON.stringify(JSON.parse(jsonVal), null, ""))
            } else {
                this.editor.setValue(JSON.stringify(JSON.parse(jsonVal), null, "\t"));
            }
            this.syncState()
        } catch (parseException) {
            console.error(parseException)
            alert("Invalid JSON!");
        }
    }

    onContentChange(newContent) {
        if (this.initialising || this.syncingState || this.tabsView.isSwitchingTab) {
            return
        }

        this.tabs.getActiveTab().setContent(newContent)
        this.syncState()
    }

    onFoldChange(line) {
        this.tabs.getActiveTab().onFoldChange(line)
        this.syncState()
    }

    onSyncState(newState) {
        this.syncingState = true
        try {
            const activeTab = this.tabs.getActiveTab()
            const activeTabState = activeTab.getState()

            // updates can happen often and we don't want to create new array each time
            // this is a shortcut to quickly empty the array in place
            this.allUuidsFromNewState.length = 0

            // add and update tabs
            for (const i in newState.data.tabs) {
                const tabState = newState.data.tabs[i]
                this.allUuidsFromNewState.push(tabState.uuid)
                let tab = this.tabs.getTabByUuid(tabState.uuid)

                if (tab) {
                    if (tab == activeTab) {
                        if (tabState.content != activeTabState.content) {
                            this.editor.setValue(tabState.content)
                        }
                        this.setFoldedLines(tabState.foldedLines)
                    }
                    tab.setFromState(tabState)
                } else {
                    // tab not found, create new tab
                    const newTab = new Tab(tabState.title, tabState.content, tabState.uuid)
                    newTab.setFromState(tabState)
                    this.tabs.addTab(newTab)
                }
            }

            // remove tabs if necessary
            const tabs = this.tabs.getTabs()
            if (tabs.length != newState.data.tabs.length) {
                for (let i = tabs.length -1; i >= 0; i--) {
                    const tab = tabs[i]
                    if (this.allUuidsFromNewState.indexOf(tab.uuid) === -1) {
                        // this is a tab to be removed
                        this.tabsView.syncRemoveTab(tab)
                    }
                }
            }

            this.tabsView.render()
        } catch (e) {
            console.error(e)
        } finally {
            this.syncingState = false
        }
    }

    setFoldedLines(foldedLines) {
        // unfold all lines first
        // this must be some bug but I just could not make it work otherwise
        const totalLines = this.editor.lineCount();
        for (let i = 0; i < totalLines; i++) {
            this.editor.foldCode(CodeMirror.Pos(i, 0), null, "unfold");
        }
        
        if (foldedLines.length) {
            foldedLines.forEach((lineNumber) => {
                this.editor.foldCode(CodeMirror.Pos(lineNumber, 0), null, "fold")
            })
        }
    }

    setScrollPos(scrollPos) {
        const scrollInfo = this.editor.getScrollInfo();
        this.editor.scrollTo(
            scrollInfo.width * scrollPos.left,
            scrollInfo.height * scrollPos.top
        )
    }

    syncState() {
        if (this.syncingState || this.initialising) {
            // avoid state sync during initialisation and also when currently updating from incomming state update
            return
        }

        const state = this.tabs.getState()
        this.sync.updateState(state, true)
    }
}

class JsonCityHeader {
    editor
    element
    modalElement

    constructor (jsonCityEditor, element, modalElement) {
        this.editor = jsonCityEditor
        this.element = element
        this.modalElement = modalElement
    }

    init() {
        this.element.querySelector('#compress').addEventListener("click", () => {
            this.editor.dispatchEvent(JsonCityEditor.EVENT_COMPRESS)
        })
    
        this.element.querySelector('#decompress').addEventListener("click", () => {
            this.editor.dispatchEvent(JsonCityEditor.EVENT_DECOMPRESS)
        })

        this.element.addEventListener('mouseover', function () {
            document.getElementById('buttons').classList.add('active');
        })
        this.element.addEventListener('mouseout', function () {
            document.getElementById('buttons').classList.remove('active');
        })

        this.element.addEventListener('mouseout', function () {
            document.getElementById('buttons').classList.remove('active');
        })
        document.querySelector('#help').addEventListener("click", () => {
            this.modalElement.style.display = "block";
        })
        document.querySelector('#help').addEventListener("click", () => {
            this.modalElement.style.display = "block";
        })
        this.modalElement.querySelector('.close').addEventListener("click", () => {
            this.modalElement.style.display = "none";
        })
    }
}

class Tab {
    uuid
    title
    content

    // relative scroll position
    scrollPosition = {
        left: 0,
        top: 0
    }

    // folded sections
    foldedLines = []

    constructor(title, content, uuid) {
        this.title = title

        if (content) {
            this.content = content
        } else {
            this.content = ''
        }

        this.uuid = uuid || crypto.randomUUID()
    }

    getTitle() {
        return this.title
    }

    setContent(content) {
        this.content = content
        return this
    }

    getContent() {
        return this.content
    }

    setScrollPosition(left, top) {
        this.scrollPosition.left = left
        this.scrollPosition.top = top
        return this
    }

    getScrollPosition() {
        return this.scrollPosition
    }

    getFoldedLines() {
        return this.foldedLines
    }

    onFoldChange(lineFoldedUnfolded) {
        var indexLineFolded = this.foldedLines.indexOf(lineFoldedUnfolded);
        if (indexLineFolded < 0) {
            this.foldedLines.push(lineFoldedUnfolded)
        } else {
            this.foldedLines.splice(indexLineFolded, 1)
        }

        return this
    }

    getState() {
        return {
            uuid: this.uuid,
            title: this.title,
            content: this.content,
            foldedLines: this.foldedLines,
            scrollPosition: this.scrollPosition
        }
    }

    setFromState(state) {
        if (state.uuid != this.uuid) {
            throw Error('Wrong tab uuid bro')
        }
        this.title = state.title
        this.content = state.content
        this.foldedLines = state.foldedLines
        this.scrollPosition.left = state.scrollPosition.left
        this.scrollPosition.top = state.scrollPosition.top
    }
}

class Tabs {
    eventBus
    tabs
    activeTabIndex

    constructor() {
        this.tabs = []
    }

    addTab(tab) {
        this.tabs.push(tab)
        return this
    }

    removeTab(tab, withConfirmation) {
        if (this.tabs.length < 2) {
            return false
        }

        if (withConfirmation) {
            if (!confirm("Are you sure?")) {
                return false
            }
        }

        const index = this.tabs.indexOf(tab)
        if (index < 0) {
            return false
        }

        this.tabs.splice(index, 1)
        if (this.activeTabIndex > this.tabs.length - 1) {
            this.activeTabIndex--
        }

        return true
    }

    getTabs() {
        return this.tabs
    }

    setActiveTab(tab) {
        const index = this.tabs.indexOf(tab)
        if (index < 0) {
            throw new Error('tab not found')
        }
        this.activeTabIndex = index
    }

    getActiveTab() {
        return this.tabs[this.activeTabIndex]
    }

    getState() {
        const state = {
            activeTabUuid: this.getActiveTab().uuid,
            tabs: []
        }
        for (const i in this.tabs) {
            state.tabs.push(this.tabs[i].getState())
        }
        return state
    }

    createTabFromState(tabState) {
        const tab = new Tab(tabState.title, tabState.content, tabState.uuid)
        tab.setFromState(tabState)

        return tab
    }

    getTabByUuid(uuid) {
        for (const i in this.tabs) {
            const tab = this.tabs[i]
            if (tab.uuid == uuid) {
                return tab
            }
        }
        return null
    }
}

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
        for (const [key, tabNodes] of this.tabNodes) {
            if (tabNodes.node.classList.contains('active')) {
                return tabNodes.node
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

class Scroller {
    element
    animationId

    // linear
    deltaX = {
        target: 0,
        applied: 0
    }
    deltaY = {
        target: 0,
        applied: 0
    }
    duration = 0
    timeStart = 0

    constructor(element) {
        this.element = element;
    }

    stop() {
        if (this.animationId) {
            window.cancelAnimationFrame(this.animationId)
        }
    }

    scrollTo(deltaX, deltaY, duration) {
        this.stop()
        if (!deltaX && !deltaY) {
            return
        }

        this.deltaX.target = deltaX
        this.deltaX.applied = 0

        this.deltaY.target = deltaY
        this.deltaY.applied = 0

        this.duration = duration

        const now = Date.now()
        this.timeStart = now

        const that = this
        this.animationId = window.requestAnimationFrame(function() {
            that.step()
        })
    }

    step() {
        const now = Date.now()
        const dt = now - this.timeStart

        if (dt < this.duration) {
            const pct = dt / this.duration
            if (this.deltaX.target) {
                const offsetX = this.deltaX.target * pct
                const diffX = offsetX - this.deltaX.applied
                this.deltaX.applied = offsetX

                this.element.scrollLeft += diffX
            }

            if (this.deltaY.target) {
                const offsetY = this.deltaY.target * pct
                const diffY = offsetY - this.deltaY.applied
                this.deltaY.applied = offsetY

                this.element.scrollTop += diffY
            }

            const that = this
            this.animationId = window.requestAnimationFrame(function() {
                that.step()
            })

        } else {
            // last step
            if (this.deltaX.target) {
                this.element.scrollLeft += this.deltaX.target - this.deltaX.applied
            }
            if (this.deltaY.target) {
                this.element.scrollTop += this.deltaY.target - this.deltaY.applied
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
	// prepare for instance of JsonCityEditor
	const instanceId = 'main' // in case you want multple editors on one page
	const element = document.getElementsByClassName('json-city-editor')[0]

	// create sync instance
	const isLocalStorageEnabled = true
	const isWindowSyncEnabled = true
	const jsonCitySync = new JsonCitySync(instanceId, element, isLocalStorageEnabled, isWindowSyncEnabled)

	// create editor instance
	const jsonCityEditor = new JsonCityEditor(instanceId, element, jsonCitySync)

	// create header instance
	const headerElement = document.getElementById('head')
	const modalElement = document.getElementById('myModal')
	const jsonCityHeader = new JsonCityHeader(jsonCityEditor, headerElement, modalElement)

	jsonCityEditor.init()
	jsonCityHeader.init()
})



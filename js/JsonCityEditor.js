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
            if (compress) {
                this.editor.setValue(JSON.stringify(JSON.parse(jsonVal), null, ""))
            } else {
                this.editor.setValue(JSON.stringify(JSON.parse(jsonVal), null, "\t"));
            }
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

    onFoldChange(line, a, b, c) {
        console.log(line, a, b, c)
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
                        if (JSON.stringify(tabState.foldedLines) != JSON.stringify(activeTabState.foldedLines)) {
                            this.setFoldedLines(tabState.foldedLines)
                        }
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
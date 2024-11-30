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
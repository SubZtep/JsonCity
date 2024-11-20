class Tabs {
    tabs
    activeTabIndex

    constructor(tabs, content) {
        if (tabs) {
            this.tabs = tabs
        } else {
            const initialTab = new Tab(1)
            this.tabs = []
            this.addTab(initialTab)
            this.setActiveTab(initialTab)
        }
    }

    addTab(tab) {
        this.tabs.push(tab)
        return this
    }

    removeTab(tab) {
        if (this.tabs.length < 2) {
            return false
        }

        if (!confirm("Are you sure?")) {
            return false
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
}
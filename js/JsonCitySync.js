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
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

	window.e = jsonCityEditor
})

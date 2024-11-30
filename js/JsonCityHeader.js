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
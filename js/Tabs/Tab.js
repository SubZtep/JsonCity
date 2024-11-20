class Tab {
    title
    #content

    // relative scroll position
    #scrollPosition = {
        left: 0,
        top: 0
    }
    // folded sections
    #foldedLines = []

    constructor(title, content) {
        this.title = title

        if (content) {
            this.#content = content
        } else {
            this.#content = ''
        }
    }

    getTitle() {
        return this.title
    }

    setContent(content) {
        this.#content = content
        return this
    }

    getContent() {
        return this.#content
    }

    setScrollPosition(left, top) {
        this.#scrollPosition.left = left
        this.#scrollPosition.top = top
        return this
    }

    getScrollPosition() {
        return this.#scrollPosition
    }

    getFoldedLines() {
        return this.#foldedLines
    }

    onFoldChange(lineFoldedUnfolded) {
        var indexLineFolded = this.#foldedLines.indexOf(lineFoldedUnfolded);
        if (indexLineFolded < 0) {
            this.#foldedLines.push(lineFoldedUnfolded)
        } else {
            this.#foldedLines.splice(indexLineFolded, 1)
        }

        return this
    }
}
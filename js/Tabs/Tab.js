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
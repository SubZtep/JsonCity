class Scroller {
    element
    animationId

    // linear
    #deltaX = {
        target: 0,
        applied: 0
    }
    #deltaY = {
        target: 0,
        applied: 0
    }
    #duration = 0
    #timeStart = 0

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

        this.#deltaX.target = deltaX
        this.#deltaX.applied = 0

        this.#deltaY.target = deltaY
        this.#deltaY.applied = 0

        this.#duration = duration

        var now = Date.now()
        this.#timeStart = now

        var that = this
        this.animationId = window.requestAnimationFrame(function() {
            that.step()
        })
    }

    step() {
        var now = Date.now()
        var dt = now - this.#timeStart

        if (dt < this.#duration) {
            var pct = dt / this.#duration
            if (this.#deltaX.target) {
                var offsetX = this.#deltaX.target * pct
                var diffX = offsetX - this.#deltaX.applied
                this.#deltaX.applied = offsetX

                this.element.scrollLeft += diffX
            }

            if (this.#deltaY.target) {
                var offsetY = this.#deltaY.target * pct
                var diffY = offsetY - this.#deltaY.applied
                this.#deltaY.applied = offsetY

                this.element.scrollTop += diffY
            }

            var that = this
            this.animationId = window.requestAnimationFrame(function() {
                that.step()
            })

        } else {
            // last step
            if (this.#deltaX.target) {
                this.element.scrollLeft += this.#deltaX.target - this.#deltaX.applied
            }
            if (this.#deltaY.target) {
                this.element.scrollTop += this.#deltaY.target - this.#deltaY.applied
            }
        }
    }
}
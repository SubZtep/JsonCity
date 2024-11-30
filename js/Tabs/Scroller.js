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
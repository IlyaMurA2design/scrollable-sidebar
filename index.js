export default class Sidebar {
    #parentSelector;
    #containerSelector;
    #sidebarSelector;

    #lastScrollTop = 0;
    #lastScrollDirection = null

    #top = 0;
    #bottom = 0;

    #marginTop = 0;
    #marginBottom = 0;


    constructor(settings) {
        this.#parentSelector = settings?.parentSelector
        this.#containerSelector = settings?.containerSelector
        this.#sidebarSelector = settings?.sidebarSelector

        this.#top = settings?.top
        this.#bottom = settings?.bottom

        this.#marginTop = settings?.marginTop
        this.#marginBottom = settings?.marginBottom

        this.#initSidebar()
    }

    #initSidebar() {
        const sidebar = document.querySelector(this.#sidebarSelector)
        sidebar?.classList.add('js-scrollable-sidebar')

        $(window).on('scroll resize', () => {
            this.#calculatePositions()
        })

        this.#calculatePositions()
    }

    #calculatePositions() {
        const sidebar = document.querySelector(this.#sidebarSelector)

        if (! sidebar?.classList?.contains('js-scrollable-sidebar')) {
            return;
        }

        const $sidebar = $(sidebar)

        const parent = document.querySelector(this.#parentSelector)
        const parentPositions = parent?.getBoundingClientRect()

        const container = document.querySelector(this.#containerSelector)
        const containerPositions = parent?.getBoundingClientRect()

        const sidebarPositions = sidebar?.getBoundingClientRect()
        const screenHeight = $(window).height()

        const scrollTop = $(window).scrollTop();
        const currentScrollDirection = scrollTop > this.#lastScrollTop ? 'down' : 'up'
        const topOffset = this.#top + this.#marginBottom

        if (
            window.matchMedia('screen and (max-width: 1199px)')?.matches
            || sidebarPositions?.height + topOffset < screenHeight
        ) {
            $sidebar
                .addClass('is-sticky')
                .removeClass('is-fixed')
                .css('transform', '')
                .css('top', topOffset + 'px')
                .width(null)

            return;
        }

        $sidebar.width($(container).width())

        if ($sidebar.hasClass('is-sticky')) {
            $sidebar
                .removeClass('is-sticky')
                .removeClass('is-fixed')

            if (sidebarPositions?.bottom + this.#marginBottom <= screenHeight) {
                this.#calculateTransformOffset(currentScrollDirection, containerPositions, sidebarPositions)
            }
        }

        if (parentPositions?.bottom - screenHeight <= 0) {
            const offset = containerPositions.height - sidebarPositions.height - this.#marginBottom

            $sidebar
                .css('top', 0 + 'px')
                .removeClass('is-fixed')
                .css('transform', `translate(0, ${offset}px)`)
        } else if (
            containerPositions.top < 0 && containerPositions.bottom > 0
            && this.#lastScrollDirection
            && currentScrollDirection !== this.#lastScrollDirection
        ) {
            if ($sidebar.hasClass('is-fixed')) {
                $sidebar
                    .removeClass('is-fixed')

                $sidebar.css('top', 0 + 'px')

                this.#calculateTransformOffset(currentScrollDirection, containerPositions, sidebarPositions)
            }
        } else {
            if (scrollTop > this.#lastScrollTop) {
                // downscroll

                if (parentPositions?.bottom - this.#marginBottom <= sidebarPositions.bottom) {
                    const offset = containerPositions.height - sidebarPositions.height - this.#marginBottom

                    $sidebar
                        .css('top', 0 + 'px')
                        .removeClass('is-fixed')
                        .css('transform', `translate(0, ${offset}px)`)
                } else if (
                    parentPositions?.bottom > sidebarPositions.bottom
                    && sidebarPositions?.bottom + this.#marginBottom <= screenHeight
                ) {
                    $sidebar.css('top', 0 + 'px')
                    this.#enableScroll(false)
                }
            } else {
                // upscroll

                if (sidebarPositions?.top <= parentPositions?.top) {
                    $sidebar.removeClass('is-fixed')
                } else if (sidebarPositions.top > this.#top + this.#marginBottom) {
                    this.#enableScroll(true)
                }

                if ($sidebar.hasClass('is-fixed')) {
                    $sidebar.css('top', topOffset + 'px')
                } else {
                    $sidebar.css('top', 0 + 'px')
                }
            }
        }

        this.#lastScrollDirection = scrollTop > this.#lastScrollTop ? 'down' : 'up'
        this.#lastScrollTop = scrollTop;
    }

    #enableScroll(isTopScroll) {
        $(this.#sidebarSelector)
            ?.css('transform', `translate(0, 0)`)
            ?.addClass('is-fixed')
            ?.addClass(
                (isTopScroll ? 'top' : 'bottom') + '-scroll'
            )
            ?.removeClass(
                (isTopScroll ? 'bottom' : 'top') + '-scroll'
            )
    }

    #calculateTransformOffset(currentScrollDirection, containerPositions, sidebarPositions) {
        const offset = Math.abs(containerPositions?.top) + sidebarPositions?.top

        $(this.#sidebarSelector)
            ?.css('transform', `translate(0, ${offset}px)`)
    }

    destroy() {
        const sidebar = document.querySelector(this.#sidebarSelector)
        sidebar?.classList.remove('js-scrollable-sidebar')
    }
}

module.exports = Sidebar
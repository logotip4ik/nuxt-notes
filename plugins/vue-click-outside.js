import Vue from 'vue'

// taken from: https://stackoverflow.com/questions/59752101/detect-click-outside-element-in-nuxt
Vue.directive('click-outside', {
  bind: (el, binding, vnode) => {
    el.clickOutsideEvent = (event) => {
      if (event.target.dataset.clickOutsideInteract) return
      if (!(el === event.target || el.contains(event.target)))
        vnode.context[binding.expression](event)
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unbind: (el) =>
    document.body.removeEventListener('click', el.clickOutsideEvent),
})

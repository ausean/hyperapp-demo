// -- IMPORTS --

import { h, app } from "hyperapp"
import { Http } from "hyperapp-fx"
import { interval } from "@hyperapp/time"

// -- ACTIONS --

const FetchStories = state => [
  { ...state, fetching: true },
  Http({
    url: `https://zaceno.github.io/hatut/data/${state.filter.toLowerCase()}.json`,
    response: "json",
    action: GotStories
  })
]

const StartEditingFilter = state => ({ ...state, editingFilter: true })

const StopEditingFilter = state =>
  FetchStories({ ...state, editingFilter: false })

const SetFilter = (state, word) => ({ ...state, filter: word })

const SelectStory = (state, id) => ({
  ...state,
  reading: id,
  stories: {
    ...state.stories,
    [id]: {
      ...state.stories[id],
      seen: true
    }
  }
})

const GotStories = (state, response) => {
  const stories = {}
  response = {
    "112": { title: "The Ocean is Sinking", author: "Kat Stropher" },
    "113": { title: "Ocean life is brutal", author: "Surphy McBrah" },
    "114": {
      title: "Family friendly fun at the ocean exhibit",
      author: "Guy Prosales"
    }
  }
  Object.keys(response).forEach(id => {
    stories[id] = { ...response[id], seen: false }
    if (state.stories[id] && state.stories[id].seen) {
      stories[id].seen = true
    }
  })
  const reading = stories[state.reading] ? state.reading : null
  return {
    ...state,
    stories,
    reading,
    fetching: false
  }
}

const ToggleAutoUpdate = state => ({ ...state, autoUpdate: !state.autoUpdate })

// -- VIEWS ---

const emphasize = (word, string) =>
  string.split(" ").map(x => {
    if (x.toLowerCase() === word.toLowerCase()) {
      return h("em", {}, x + " ")
    } else {
      return x + " "
    }
  })

const StoryThumbnail = props =>
  h(
    "li",
    {
      onClick: [SelectStory, props.id],
      class: {
        unread: props.unread,
        reading: props.reading
      }
    },
    [
      h("p", { class: "title" }, emphasize(props.filter, props.title)),
      h("p", { class: "author" }, props.author)
    ]
  )

const StoryList = props =>
  h("div", { class: "stories" }, [
    props.fetching &&
      h("div", { class: "loadscreen" }, [h("div", { class: "spinner" })]),

    h(
      "ul",
      {},
      Object.keys(props.stories).map(id =>
        StoryThumbnail({
          id,
          title: props.stories[id].title,
          author: props.stories[id].author,
          unread: !props.stories[id].seen,
          reading: props.reading === id,
          filter: props.filter
        })
      )
    )
  ])

const Filter = props =>
  h("div", { class: "filter" }, [
    "Filter:",

    props.editingFilter
      ? h("input", {
          type: "text",
          value: props.filter,
          onInput: [SetFilter, event => event.target.value] // <----
        })
      : h("span", { class: "filter-word" }, props.filter),

    props.editingFilter
      ? h("button", { onClick: StopEditingFilter }, "\u2713")
      : h("button", { onClick: StartEditingFilter }, "\u270E")
  ])

const StoryDetail = props =>
  h("div", { class: "story" }, [
    props && h("h1", {}, props.title),
    props &&
      h(
        "p",
        {},
        `
        Lorem ipsum dolor sit amet, consectetur adipiscing
        elit, sed do eiusmod tempor incididunt ut labore et
        dolore magna aliqua. Ut enim ad minim veniam, qui
        nostrud exercitation ullamco laboris nisi ut aliquip
        ex ea commodo consequat.
      `
      ),
    props && h("p", { class: "signature" }, props.author)
  ])

const AutoUpdate = props =>
  h("div", { class: "autoupdate" }, [
    "Auto update: ",
    h("input", {
      type: "checkbox",
      checked: props.autoUpdate, // <---
      onInput: ToggleAutoUpdate // <---
    })
  ])

const Container = content => h("div", { class: "container" }, content)

// -- RUN --

app({
  node: document.getElementById("app"),
  view: state =>
    Container([
      Filter(state),
      StoryList(state),
      StoryDetail(state.reading && state.stories[state.reading]),
      AutoUpdate(state)
    ]),
  init: FetchStories({
    editingFilter: false,
    autoUpdate: false,
    filter: "ocean",
    reading: null,
    stories: {}
  }),
  subscriptions: state => [
    state.autoUpdate && interval(FetchStories, { delay: 5000 })
  ]
})



var app = new Vue({
  el: '#app',
  data: {
    pageStr: '100',
    page: 100,
    date: '',
    time: '',
    stories: {},
    subsetOfStories: {},
    story: {}
  },
  computed: {
    paddedPageStr: function() {
      return this.pageStr.padEnd(3, '_')
    }
  },
  created() {
    window.addEventListener('keydown', (e) => {
      if (e.keyCode>=48 && e.keyCode <=58) {
        if (app.pageStr.length === 3) {
          app.pageStr = ''
        }
        app.pageStr += e.key
        if(app.pageStr.length === 3) {
          app.page = parseInt(app.pageStr)
        }
        console.log(app.pageStr)
      } else if (e.keyCode === 8 ) {
        if (app.pageStr.length > 0) {
          app.pageStr = app.pageStr.substr(0,app.pageStr.length - 1)
        }
      } else {
        console.log('could not find', e)
      }
    });
  },
  watch: {
    page: function() {
      if (this.page.toString().length !== 3) {
        return
      }
      this.subsetOfStories = {}
      this.story = {}
      if (this.page == 100) {
        return
      } 
      if (this.page >= 200) {
        this.story = this.stories[this.page]
      } else {
        const start = 200 + (this.page - 101) * 10
        for(var i = start; i < start + 10; i++) {
          this.subsetOfStories[i] = this.stories[i]
        }
      }
    }
  }
})

const formatDate = function() {
  const d = new Date()
  app.date = d.toISOString()
}
setInterval(formatDate, 1000)

const fetchURL = async function(url) {
  return new Promise((resolve, reject) => {
    fetch(url).then(function(response) {
      return response.json();
    }).then(function(j) {
      resolve(j)
    });
  })
}
const loadStories = async function() {
  return fetchURL('https://hacker-news.firebaseio.com/v0/topstories.json')
}

const loadStory = async function(id) {
  const url = 'https://hacker-news.firebaseio.com/v0/item/' + id + '.json'
  return fetchURL(url)
}

const startup = async function() {
  const stories = await loadStories()
  console.log(stories)
  let id = 200
  for(var i in stories) {
    const story = await loadStory(stories[i])
    if (story.text) {
      story.text = he.decode(story.text).replace(/<[^>]*>?/gm, '')
    } else {
      story.text = ''
    }
    if (story.url) {
      const u = new URL(story.url)
      story.shorturl = u.hostname 
    }
    app.stories[id] = story
    id++
    if (id >= 250) {
      break
    }
  }
}
startup()
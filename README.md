## Usage

### Apply Filters
```js
function eleventy(config) {
    const filters = require('@istree/11ty');
    filters.init(config);
}
```

same as
```js
function eleventy(config) {
    const filters = require('@istree/11ty');
    for(let key in filters) {
        config.addFilter(key, filters[key]);
    }
}
module.exports = eleventy;
```

### slice
latest 10 posts
```liquid
{% assign latest10Posts = collections['blog'] | reverse | slice : '0', '10' %}
```

### keys
```liquid
{% assign tagList = collections | keys | sort %}
```

### concat
```liquid
{% for tag in tagList %}
    {% assign aHref = '/tags/' | concat : tag, '/' %}
    <a href="{{ aHref }}" rel="permalink">{{ tag }}</a></br>
{% endfor %}
```

### filter
Apply condition to collections
```liquid
{% assign pageList = collections['11ty']
| filter: 'data.type', '==', 'docs'
| filter: 'fileSlug', '!=', '11ty'
| sortByProp : 'data.title'
%}
```

### normalize
```json
{
  "permalink": "/posts/{{ page.fileSlug | normalize }}/"
}
```

### removeHyphen
```liquid
{{ page.fileSlug | removeHyphen}}
```

### dateTime
```liquid
{{ page.date | dateTime: '/y/M/d/' }}
```

### sort
```liquid
{% assign tagList = collections | keys | sort %}
```

### sortByProp
```liquid
{% assign postList = collections[tag] | sortByProp : 'data.title' %}
```

### groupBy
post by year
```liquid
{% assign postsByYearList = collections['blog'] | groupBy: 'date', 'dateTime', 'y' | reverse %}
```

nested loop
```liquid
{% for postsByYear in postsByYearList %}
    <h1>{{postsByYear.name}}</h1>
    {% assign postsByMonth = postsByYear.values | groupBy: 'date', 'dateTime', 'M' | reverse %}
    {% for postsEachMonth in postsByMonth %}
        <h2>{{ postsEachMonth.name }}</h2>
        {% for post in postsEachMonth.values %}
            <a href="{{ post.url }}" rel="permalink">{{ post.fileSlug }}</a><br/>
        {% endfor %}
    {% endfor %}
{% endfor %}
```

### groupByExt
post by year
```liquid
{% assign postsByYearGroup = collections['blog']
| groupByExt: "['date', 'dateTime', 'y' ]", "['reverse']"
| groupByExt: "['date', 'dateTime', 'M' ]", "['reverse']"
| groupByExt: "['date', 'dateTime', 'd' ]", "['reverse']"
%}
```

nested loop
```liquid
{% for postsByYear in postsByYearGroup %}
    <h1>{{ postsByYear.name }} Year</h1>
    {% for postsByMonth in postsByYear.values %}
        <h2>{{ postsByMonth.name }} Month</h2>
        {% for postsByDay in postsByMonth.values %}
            <h3>{{ postsByDay.name }} Day</h3>
            {% for post in postsByDay.values %}
                <a href="{{ post.url }}" rel="permalink">{{ post.fileSlug }}</a><br/>
            {% endfor %}
        {% endfor %}
    {% endfor %}
{% endfor %}
```

### defaultTitle
```json
{
    "eleventyComputed": {
        "title": "{{ title | defaultTitle : page.fileSlug }}"
    }
}
```

### defaultPageTitle
```liquid
{{ post | defaultPageTitle }}
```

### print
equal to console.log
```liquid
{% assign posts = 'any string' | print: 'apple', 'car' %}
```

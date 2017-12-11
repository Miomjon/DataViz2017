function buildMap(obj) {
    let map = new Map();
    Object.keys(obj).forEach(key => {
        map.set(key, obj[key]);
    });
    return map;
}

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function createActivityData(metadata) {
  var activities = [0,0,0,0];
  for(let times of metadata.timeslots) {
    activities[times.activity%95] += 1
  }
  var datActivity = [];
  for(var i = 0; i < activities.length; i++) {
    var temp = {
      "duration": activities[i],
      "activity": i
    }
    datActivity.push(temp);
  }
  return datActivity;
}

function getSeason(exam_time, exam_type) {
  if(exam_time === "Winter") {
    if(exam_type === "During the semester") {
      return "🍁"
    }
    return "❄️";
  }
  if(exam_type === "During the semester") {
    return "🌼"
  }
  return "☀️";
}

class CourseList {

  constructor() {
    this.enableCourseList = [];
    this.coursesInList = [];
    this.conflictList = new Map();
  }

  createCourseList(data) {

    let table = document.getElementById(DaViSettings.courseListId);

    let tbody = document.createElement("tbody");
    table.appendChild(tbody);

    let titlerow =  document.createElement("tr");
    let cell = document.createElement("th");
    cell.innerHTML = "Courses";

    titlerow.appendChild(cell)
    tbody.appendChild(titlerow)
    let i =0
    for(let [course, metadata] of data) {

      let row = document.createElement("tr");
      row.className = DaViSettings.courseListRowClass;
      tbody.appendChild(row);

      let courseName = document.createElement("td");
      row.appendChild(courseName)
      // courseName.innerHTML = course;

      // courseName.className = DaViSettings.cellCourseRow;

      let hover = document.createElement("div");
      hover.id = course + "_button";
      hover.style.background =  "#f6f6f6"
      hover.className = DaViSettings.tooltipClass;
      hover.innerHTML = course;
      courseName.appendChild(hover)

      let hoverInside = document.createElement("div");
      hoverInside.className = DaViSettings.tooltipTextClass;
      // hoverInside.innerHTML = course
      hoverInside.id = "Fixme2"+i
      hover.appendChild(hoverInside)

      d3.select("#"+hoverInside.id)
        .append("span")
        .text(course)

      var activities = createActivityData(metadata);

      var inside = d3.select("#"+hoverInside.id)
                      .append("div")

      inside.append("div")
          .style("float", "left")
          .selectAll('div')
          .data(activities).enter()
          .append('div')
          .text(function(d) { return d.duration; })
          .style("background", d => DaViSettings.cellColorMap[d.activity])
          .style("width", function(d) { return d.duration*10 + "px"; });

      inside.append("div")
             .text("Credits: ")
             .append("b")
             .text(metadata.credits)

      //exam type/block/
      var season = getSeason(metadata.exam_time, metadata.exam_type)
      inside.append("div")
              .text("Time: " + season);

      i ++;
    }
  }

  enableCourse(c, event) {
    if(this.coursesInList.includes(c)) {
      var index = this.coursesInList.indexOf(c);
      if (index > -1) {
        this.enableCourseList.splice(index, 1);
        this.coursesInList.splice(index, 1);
        timtable.removeCourse(c, new Vec(event.clientX, event.clientY));
        var wasOrange = false;
        for(let conflict of this.conflictList.get(c)) {
          if(document.getElementById(conflict+"_button").style.backgroundColor === "orange"||document.getElementById(conflict+"_button").style.backgroundColor === "green") {
            document.getElementById(conflict+"_button").style.backgroundColor = "green";
            wasOrange = true;
          } else {
            document.getElementById(conflict+"_button").style.backgroundColor = "#f6f6f6"
          }
        }
        if(wasOrange) {
          document.getElementById(c+"_button").style.backgroundColor = "red";
        } else {
          document.getElementById(c+"_button").style.backgroundColor = "#f6f6f6"
        }
      }
    } else {
        this.enableCourseList.push(c)
        this.coursesInList.push(c)
        timtable.addCourse(c, new Vec(event.clientX, event.clientY));
        var wasGreen = false;
        for(let conflict of this.conflictList.get(c)) {
          if(document.getElementById(conflict+"_button").style.backgroundColor === "green" || document.getElementById(conflict+"_button").style.backgroundColor === "orange") {
            document.getElementById(conflict+"_button").style.backgroundColor = "orange";
            wasGreen = true;
          } else {
            document.getElementById(conflict+"_button").style.backgroundColor = "red"
          }
        }
        if(wasGreen) {
          document.getElementById(c+"_button").style.backgroundColor = "orange";
        } else {
          document.getElementById(c+"_button").style.backgroundColor = "green";
        }
    }
    for(let conf of this.enableCourseList) {
      var goesOrange = false;
      // console.log(Array.from(this.conflictList.get(conf)))
      for(let list of this.conflictList.get(conf)) {
        if(document.getElementById(list+"_button").style.backgroundColor === "green" || document.getElementById(list+"_button").style.backgroundColor === "orange") {
          document.getElementById(list+"_button").style.backgroundColor = "orange";
          goesOrange = true;
        } else {
          document.getElementById(list+"_button").style.backgroundColor = "red"
        }
      }
      if(goesOrange) {
        document.getElementById(conf+"_button").style.backgroundColor = "orange"
      } else {
        document.getElementById(conf+"_button").style.backgroundColor = "green"
      }

    }
  }

// remove and do a function that precomputes the conflicts for each course
  conflicts(data) {
    for(let [course, metadata] of data) {
      var list = [];
      for(let [otherCourse, otherMetadata] of data) {
        if(course !== otherCourse) {
          for(let timeslot of metadata.timeslots) {
            for(let otherTimeslot of otherMetadata.timeslots) {
              if(timeslot.day === otherTimeslot.day && timeslot.time === otherTimeslot.time) {
                list.push(otherCourse);
              }
            }
          }
        }
      }
      var uniqueList = list.filter(function(item, pos, self) {
          return self.indexOf(item) == pos;
      })
      this.conflictList.set(course, uniqueList);
    }
  }

  showDetails(course, metadata) {

    var details = d3.select("#courseInfo")
                    .html("")

    details.style("padding-left", "5px")

    var conflicts = details.append("div")

    var confTitle = conflicts.append("span")
                              .text("Conflicts")
                              .classed(DaViSettings.titlesInfo, true)

    for(var i = 0; i < this.conflictList.get(course).length; i++) {
      conflicts.append("div")
                .text(this.conflictList.get(course)[i])
    }

    conflicts.style("height", "50%")
              .style("overflow-y", "scroll")

    details.append("hr")

    var descr = details.append("div")

    var descrTitle = descr.append("span")
                           .text("Description")
                           .classed(DaViSettings.titlesInfo, true)

    descr.append("div")
            .text(metadata.summary)
            .style("bottom", "0px")

    descr.style("overflow-y", "scroll")

  }
}


let courselist = new CourseList()
let data_map = buildMap(ISA_data);
courselist.createCourseList(data_map)
courselist.conflicts(data_map)
for(let [course, metadata] of data_map) {
  document.getElementById(course+"_button").onclick = (event) => courselist.enableCourse(course, event);
  document.getElementById(course+"_button").onmouseover = function(){courselist.showDetails(course, metadata)}
}

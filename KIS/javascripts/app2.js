let data;

JSONP({
    url: 'https://hesa-broadcaster.neptune-preprod.bris.ac.uk/kiscourse',
    data: { courseId: $courseId },    
    success: function(result) { 
        data = result;
        console.log(data);
        renderAssessmentStatistics();
        renderTeachingStatistics();
    }
});

// render assessment stats
function renderAssessmentStatistics() {
    const assessmentTitle = (`
    <h2 class="module-heading"><span class="mh-text">Assessment</span></h2>
    <p>How work is assessed, by year for this course.</p>
  `);

    const assessmentLoop = data.assessment.map(data =>
            `<div class="bar-chart-container">
  <h2>Year ${data.stage}</h2>
    <ul class="bar-chart">
  <li><span class="bc-percentage">${data.written}%</span> Written exams <span class="bc-bar" style="width: ${data.written}%"></span></li>
  <li><span class="bc-percentage">${data.practical}%</span> Practical exams <span class="bc-bar" style="width: ${data.practical}%"></span></li>
  <li><span class="bc-percentage">${data.coursework}%</span> Coursework <span class="bc-bar" style="width: ${data.coursework}%"></span></li>
  </ul>
  </div>
  `).join('');
    const outputHTML = assessmentTitle.concat(assessmentLoop);
    document.querySelector('#assessment').innerHTML = outputHTML;
}



// render teaching stats
function renderTeachingStatistics() {
    const assessmentTitle = (`
    <h2 class="module-heading"><span class="mh-text">Teaching</span></h2>
    <p>The percentage of time spent in different learning activities, by year for this course.</p>
  `);

    const assessmentLoop = data.teaching.map(data =>
            `<div class="bar-chart-container">
  <h2>Year ${data.stage}</h2>
    <ul class="bar-chart">
  <li><span class="bc-percentage">${data.scheduled}%</span> Lectures, seminars and similar<span class="bc-bar" style="width: ${data.scheduled}%"></span></li>
  <li><span class="bc-percentage">${data.independent}%</span> Independent studies<span class="bc-bar" style="width: ${data.independent}%"></span></li>
  <li><span class="bc-percentage">${data.placement}%</span> Placements (if relevant)<span class="bc-bar" style="width: ${data.placement}%"></span></li>
</ul>
</div>
  `).join('');

    const outputHTML = assessmentTitle.concat(assessmentLoop);
    document.querySelector('#teaching').innerHTML = outputHTML;
}

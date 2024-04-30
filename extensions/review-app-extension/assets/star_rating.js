const myUrl = `https://iv-glasgow-cheers-ko.trycloudflare.com`

function test(shop, handle, avgRating, count) {

  setData(shop, avgRating, count , handle)

}

function getColor(shop) {

  fetch(`${URL}/api/checkTableExists/${JSON.stringify(shop)}`)
    .then(res => res.json())
    .then(tableExists => {
      if (tableExists === true) {
        console.log('table exists ..')
        fetch(`${myUrl}/api/starColor/${JSON.stringify(shop)}`)
          .then(res => res.json())
          .then(data => { setColor(data) })
      }
      else {
        setColor('#FFFF00')
      }
    })


}

function setColor(data) {
  const { color } = data;
  let activeStars = document.getElementsByClassName('active-star');
  let halfStar = document.getElementById('half-star');
  halfStar?.style.setProperty('--star-color', color);

  for (var i = 0; i < activeStars.length; i++) {
    activeStars[i].style.color = color;
  }

}

function setData(shop, avgRating, count , handle) {

  let starss = [1, 2, 3, 4, 5]

  let Html = starss.map((itm) => {

    if (avgRating >= itm) {
      return '<a href="#" class="review-star active-star" >&#9733</a>'
    }
    else if (Number(avgRating) + 0.5 >= itm) {
      return '<a href="#" class="review-star "  id="half-star">&#9733</a>'
    }
    else {
      return '<a href="#" class="review-star inactive-star" >&#9733</a>'
    }
  }).join('')

  document.getElementById('review-list').innerHTML = Html;
  document.getElementById('rating-count-block').innerHTML = `${avgRating}`;

  fetch(`${URL}/api/checkTableExists/${JSON.stringify(shop)}`)
    .then(res => res.json())
    .then(tableExists => {
      if (tableExists === true) {
        fetch(`${myUrl}/api/getBadgeDetails/${JSON.stringify(shop)}/${JSON.stringify(handle)}`)
          .then(res => res.json())
          .then(data => {
            let mydata=JSON.parse(data)
            const {reviewsBadge , noReviewsBadge} = mydata; 

            if (count < 1) {
              console.log(noReviewsBadge)
              document.getElementById('review-count-block').innerHTML = noReviewsBadge;
            }
            else{
              document.getElementById('review-count-block').innerHTML = reviewsBadge.replaceAll("${count}", count);
            }
            
          }
          )
      }
      else {
        if (count < 1) {
          document.getElementById('review-count-block').innerHTML = `(No reviews)`;
        }
        else{
          document.getElementById('review-count-block').innerHTML = `(${count} reviews)`;
        }

      }
    })


  getColor(shop)
}

function scrollToReviews() {
  const element = document.getElementById('review-section');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}







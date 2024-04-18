const myUrl = `https://mime-pdas-samoa-pastor.trycloudflare.com`

   function test(shop, handle , avgRating , count) {
    fetch(`${myUrl}/api/getReviewCount/${JSON.stringify(shop)}/${JSON.stringify(handle)}`)
      .then(res => res.json())
      .then(data => { setData(data, shop , avgRating , count)})
     
    }

    function getColor(shop){
      fetch(`${myUrl}/api/starColor/${JSON.stringify(shop)}`)
        .then(res => res.json())
        .then(data => { setColor(data) })
    }

   function setColor(data){
    const {color}=data;
    console.log('herer')
    let activeStars=document.getElementsByClassName('active-star');
    let halfStar=document.getElementById('half-star');
    halfStar?.style.setProperty('--star-color', color);

    for (var i = 0; i < activeStars.length; i++) {
        activeStars[i].style.color = color;
      }

  }

  function setData(data , shop , avgRating , count){

    console.log('meta avg ', avgRating)
    let starss=[1,2,3,4,5]
    const {averageRating , reviewCount} = data;

    let Html=starss.map((itm)=>{
    
        if(avgRating>=itm){
            return '<a href="#" class="review-star active-star" >&#9733</a>'
        }
        else if(Number(avgRating) + 0.5 >= itm  ){
            return '<a href="#" class="review-star "  id="half-star">&#9733</a>'
        }
        else{
            return '<a href="#" class="review-star inactive-star" >&#9733</a>'

        }
    }).join('')

    document.getElementById('review-list').innerHTML=Html;
    document.getElementById('review-count-block').innerHTML=`(${count} reviews)`;
    document.getElementById('rating-count-block').innerHTML=`${avgRating}`;
    getColor(shop)
  }

  function scrollToReviews() {
    const element = document.getElementById('review-section');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}





  

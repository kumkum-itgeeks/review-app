

function test(obj, shop) {
  
  fetch(`https://pointer-research-nd-bill.trycloudflare.com/api/addReviews/${JSON.stringify(obj)}/${JSON.stringify(shop)}`)
  .then(res => res.json())
  .then(data => console.log(data))

}

function getReviews(shop, pid) {
  fetch(`https://pointer-research-nd-bill.trycloudflare.com/api/getReviews/${JSON.stringify(shop)}/${pid}`)
    .then(res => res.json())
    .then(data => document.getElementById('review-listing').innerHTML=dataDistructure(data))
    
}


function dataDistructure(data){
  let html = '';
  data.forEach(obj => {
      html += createHTMLForObject(obj);
  });
  return html;
}


function createHTMLForObject(itm){
  let stars=[1,2,3,4,5];
return`
<div id='review-list-section'>
<hr/>
<div class='rating' >
${
  stars.map((star)=>{
    if (itm.starRating >= star){
     return`
      <a href="#" style="color:yellow" >&#9733;</a>
      `
    }
    else{
     return`
      <a href="#" >&#9733;</a>
      `
    }
  })
}

    </div>
    <h3 id='review-title-list' > ${itm.reviewTitle} </h3>
    <p>${itm.userName} on ${itm.datePosted}</p>
    <p> ${itm.reviewDescription} </p>
    <div id='reply-box'>
        <p> ${itm.reply} - admin reply </p>
    </div>

</div>`

}


let currentRating = 0;

function handleButtonClick(e) {
  document.getElementById('form-section').style.display = 'block'
  document.getElementById('submit-message').style.display = 'none'


  e.preventDefault();
}

document.addEventListener('DOMContentLoaded', function () {
  const stars = document.querySelectorAll('.star-rating .star');


  stars.forEach(star => {
    star.addEventListener('mouseenter', function () {
      const rating = this.getAttribute('data-rating');
      stars.forEach(s => {
        if (s.getAttribute('data-rating') <= rating) {
          s.classList.add('active');
          s.style.opacity = '1';
        } else {
          s.style.opacity = '0.5'; // Fading effect for unselected stars on hover
        }
      });
    });

    star.addEventListener('mouseleave', function () {
      if (currentRating !== 0) {
        stars.forEach(s => {
          if (s.getAttribute('data-rating') <= currentRating) {
            s.classList.add('active');
            s.style.opacity = '1';
          } else {
            s.classList.remove('active');
            s.style.opacity = '0.5'; // Fading effect for unselected stars after click
          }
        });
      } else {
        stars.forEach(s => {
          s.classList.remove('active');
          s.style.opacity = '1'; // Restore opacity for all stars after mouseleave
        });
      }
    });

    star.addEventListener('click', function (e) {
      e.preventDefault();
      const rating = this.getAttribute('data-rating');
      if (currentRating == rating) {
        currentRating = 0; // Deselecting the star if clicked again
      } else {
        currentRating = rating;
      }

      console.log('You rated ' + currentRating + ' stars.');
      stars.forEach(s => {
        if (s.getAttribute('data-rating') <= currentRating) {
          s.classList.add('active');
          s.style.opacity = '1';
        } else {
          s.classList.remove('active');
          s.style.opacity = '0.5'; // Fading effect for unselected stars after click
        }
      });
    });
  });
});



function handleSubmit(e, id, shop, product) {
  e.preventDefault();
  let isEmailValid = false;
  let isNameValid = false;
  let isTitleValid = false;
  let isBodyValid = false;
  let nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^\S+@\S+\.\S+$/;
  const name = document.getElementById('nameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  const reviewTitle = document.getElementById('reviewTitleInput').value.trim();
  const reviewBody = document.getElementById('reviewBodyInput').value.trim();
  const ThankyouMessage = document.getElementById('submit-message')
  const Form = document.getElementById('form-section')
  const reviewLink = document.getElementById('write-review-link')

  if ((email.match(emailRegex)) && (email != '')) {
    isEmailValid = true;
  }
  else {
    isEmailValid = false;
  }


  if ((name.match(nameRegex)) && (name != '') && (name.length <= 25)) {
    isNameValid = true;
  }
  else {
    isNameValid = false;
  }

  if ((reviewTitle != '') && (reviewTitle.length <= 100)) {
    isTitleValid = true;


  }
  else {
    isTitleValid = false;
  }

  if ((reviewBody != '') && (reviewBody.length <= 1500)) {
    isBodyValid = true;

  }
  else {
    isBodyValid = false;
  }



  if (isNameValid === false || isTitleValid === false || isBodyValid === false || currentRating === 0 || isEmailValid === false) {

    if (isNameValid === false) {
      document.getElementById('nameErr').innerHTML = "Please enter a valid name !"
    }
    else {
      document.getElementById('nameErr').innerHTML = '';
    }
    if (isEmailValid === false) {
      document.getElementById('emailErr').innerHTML = "Please enter valid email !"
    }
    else {
      document.getElementById('emailErr').innerHTML = '';
    }

    if (isTitleValid === false) {
      document.getElementById('titleErr').innerHTML = "Title length must be between 1-100 !"
    }
    else {
      document.getElementById('titleErr').innerHTML = '';
    }
    if (isBodyValid === false) {
      document.getElementById('bodyErr').innerHTML = " Body length must be between 1-1500!"
    }
    else {
      document.getElementById('bodyErr').innerHTML = '';
    }
    if (currentRating === 0) {
      document.getElementById('ratingErr').innerHTML = "rating must be given !"
    }
    else {
      document.getElementById('ratingErr').innerHTML = '';
    }


  } else {

    var errorMessages = document.getElementsByClassName('err');
    for (var i = 0; i < errorMessages.length; i++) {
      errorMessages[i].innerHTML = '';
    }
    //  window.confirm('Form submitted successfully!');
    const dataObj = {
      reviewTitle: reviewTitle,
      reviewDescription: reviewBody,
      userName: name,
      StarRating: currentRating,
      Email: email,
      productid: id,
      productHandle: product
    }

    test(dataObj, shop);
   

    ThankyouMessage.style.display = 'block';
    Form.style.display = 'none';
    reviewLink.display = 'none'
    var inputBoxes = document.getElementsByClassName('input-box');
    for (var i = 0; i < inputBoxes.length; i++) {
      inputBoxes[i].value = '';
    }
    currentRating = 0;
    stars.forEach((star) => {
      star.classList.remove('active');
    })


  }
}

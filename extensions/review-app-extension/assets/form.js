
//global variables*********
let currentPage = 1;
var isthisLastPage;
let PageNumber = document.getElementById('page-number-display').value;
const url = `https://hottest-sought-sharon-learning.trycloudflare.com`

// dom content loaded********

//setting star value
document.addEventListener('DOMContentLoaded', function () {
  const stars = document.querySelectorAll('.star-rating .star');
  PageNumber = 1;


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


// sending formdata****


function addReviews(obj, shop) {

  fetch(`${url}/api/addReviews/${JSON.stringify(obj)}/${JSON.stringify(shop)}`)
    .then(res => res.json())
    .then(data => console.log(data))

}

// checking if to show reviews on load**** (according to app setting)


function getOnloadReviewsSetting(shop, pid) {

  fetch(`${url}/api/checkReviewsOnload/${JSON.stringify(shop)}`)
    .then(res => res.json())
    .then(data => {
      if (data === true) {
        console.log(data)
        document.getElementById('review-listing').style.display = 'block'
        document.getElementById('review-count').style.textDecoration = 'none'
        document.getElementById('review-count').style.pointerEvents = 'none'
      }
      else {

        document.getElementById('review-listing').style.display = 'none'
      }
      getReviews(shop, pid, PageNumber);
    }
    )
}

// changing functionality for based on onload function results *****

function changeReviewDisplay(e) {
  e.preventDefault();
  let display = document.getElementById('review-listing').style.display;
  if (display == 'block') {

    document.getElementById('review-listing').style.display = 'none';
  }
  else {
    document.getElementById('review-listing').style.display = 'block';
  }
}

// get review list *****

function getReviews(shop, pid, page) {

  fetch(`${url}/api/getReviews/${JSON.stringify(shop)}/${pid}/${page}`)
    .then(res => res.json())
    .then(data => {
      setReviewInfo(data)
    }
    )
}


// pagination functionality ********
function setPrev(shop, pid, e) {
  e.preventDefault();
  console.log('prev')
  PageNumber == 1 ?
    document.getElementById('prev-btn').disabled = true
    :
    document.getElementById('prev-btn').disabled = false
  document.getElementById('next-btn').disabled = false

  PageNumber -= 1
  getReviews(shop, pid, PageNumber)


  console.log('page=>', PageNumber)

}

function setNext(shop, pid, e) {

  e.preventDefault();

  // console.log('last page',isthisLastPage)

  if (isthisLastPage) {
    document.getElementById('next-btn').disabled = true
  }
  else {
    document.getElementById('next-btn').disabled = false
    document.getElementById('prev-btn').disabled = false

    PageNumber = PageNumber + 1;
    getReviews(shop, pid, PageNumber)
  }

  console.log('page=>', PageNumber)
}

// fetching app setting data *******

function getSettingsData(shop) {

  fetch(`https://finances-bus-stand-calculator.trycloudflare.com/api/getSettingsData/${JSON.stringify(shop)}`)
    .then(res => res.json())
    .then(data => setSettings(data)
    )
}



const setReviewInfo = (data) => {

  let stars = [1, 2, 3, 4, 5];
  let reviewCountTitle = document.getElementById('review-count-title')
  let noReviewTitle = document.getElementById('no-review-title')
  document.getElementById('review-listing').innerHTML = dataDistructure(data.reviews),
    document.getElementById('average-rating').innerHTML = `<div class='rating' >${stars.map((star) => {
      return data.averageRating >= star ? '<a href="#" class="review-list-star">&#9733;</a>' : '<a href="#">&#9733;</a>';
    }).join('')}<div class='rating' >`;

  setSettings(data);


}

function setSettings(data) {

  //star settings
  const { settingData, length, reviews, averageRating, isLastPage } = data;

  isthisLastPage = isLastPage;

  starColorData = settingData.filter((itm) => (itm.starIconColor))
  let star = document.getElementsByClassName('review-list-star');
  let ratingStar = document.querySelectorAll('.star.active');

  for (var i = 0; i < ratingStar.length; i++) {
    ratingStar[i].style.color = (starColorData.filter((itm) => itm.starIconColor.customColor));
  }

  // let ratingStar = document.querySelectorAll('.star.active');

  // for (let i = 0; i < ratingStar.length; i++) {
  //   let customColor = starColorData[i].starIconColor.customColor;
  //   ratingStar[i].style.color = customColor;
  // }

  for (var i = 0; i < star.length; i++) {
    star[i].style.color = (starColorData.map((itm) => itm.starIconColor.customColor));

  }


  //review listing layout 

  let reviewListingData = settingData.filter((itm) => (itm.reviewListingLayout))
  let reviewSection = document.getElementById('review-section');
  let divider = document.getElementsByTagName('hr');

  reviewSection.style.borderColor = (reviewListingData.map((itm) => itm.reviewListingLayout.bordercolor));
  reviewSection.style.padding = (reviewListingData.map((itm) => `${itm.reviewListingLayout.reviewListingPadding}px`));

  for (var i = 0; i < divider.length; i++) {
    divider[i].style.backgroundColor = (reviewListingData.map((itm) => itm.reviewListingLayout.dividercolor));

  }

  //review listing text
  let reviewListingTextData = settingData.filter((itm) => (itm.reviewListingText));
  let reviewHeadline = document.getElementById('review-headline');
  let reviewLink = document.getElementById('review-link-title');
  let noReviewTitle = document.getElementById('no-review-title');
  let reviewCountTitle = document.getElementById('review-count-title');
  let NextButton = document.getElementById('next-btn')
  let PrevButton = document.getElementById('prev-btn')
  let reportReview = document.querySelectorAll('#report-review')

  reviewHeadline.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.reviewHeadline}`));
  reviewLink.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.reviewLink}`));
  NextButton.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.paginationNextLabel}`));
  PrevButton.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.paginationPrevLabel}`));
  // reportReview.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.reportAsinappropriate}`));
  length ?
    reviewCountTitle.innerText = reviewListingTextData.map((itm) => `${itm.reviewListingText.reviewSummary}, ${'here', length}`) :
    noReviewTitle.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.noReviewSummary}`));
 
    for (var i = 0; i < reportReview.length; i++) {
      reportReview[i].innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.reportAsinappropriate}`));

  
    }

  // review form text 

  let reviewFormTextData = settingData.filter((itm) => (itm.reviewFormText));
  console.log(reviewFormTextData)
  let EmailPlaceholderValue = (reviewFormTextData.map((itm) => `${itm.reviewFormText.emailHelpMessage}`));
  let NamePlaceholderValue = (reviewFormTextData.map((itm) => `${itm.reviewFormText.nameHelpMessage}`));
  let reviewTitlePlaceholderValue = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewTitleHelpMessage}`));
  let reviewBodyPlaceholderValue = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewBodyHelpMessage}`));
  let locationPlaceholderValue = (reviewFormTextData.map((itm) => `${itm.reviewFormText.locationHelpMessage}`));

  let FormTitle = document.getElementById('review-form-title');
  let submitButtonTitle = document.getElementById('submit-btn-title');
  let SuccessMessage = document.getElementById('success-message');
  let EmailInput = document.getElementById('emailInput');
  let NameInput = document.getElementById('nameInput');
  let ReviewTitleInput = document.getElementById('reviewTitleInput');
  let reviewBodyInput = document.getElementById('reviewBodyInput');
  let locationInput = document.getElementById('locationInput');
  let locationErr = document.getElementById('locationErr');

  let LocationLabel = document.getElementById('location-label');
  locationInput.setAttribute("placeholder", locationPlaceholderValue);

  let EmailLabel = document.getElementById('email-label');
  EmailInput.setAttribute("placeholder", EmailPlaceholderValue);

  let NameLabel = document.getElementById('name-label');
  NameInput.setAttribute("placeholder", NamePlaceholderValue);

  let RatingLabel = document.getElementById('rating-label');

  let reviewTitleLabel = document.getElementById('review-title-label');
  ReviewTitleInput.setAttribute("placeholder", reviewTitlePlaceholderValue);

  let reviewDescLabel = document.getElementById('review-desc-label');
  reviewBodyInput.setAttribute("placeholder", reviewBodyPlaceholderValue);

  //email Input display 

  reviewFormTextData.filter((itm) => {
    if (itm.reviewFormText.emailType === 'hidden') {
      EmailLabel.style.display = 'none';
      EmailInput.style.display = 'none';
      EmailInput.setAttribute('isRequired', false)


    }
    else if (itm.reviewFormText.emailType === 'optional') {
      EmailInput.setAttribute('isRequired', false)
    }
    else {
      EmailLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.authorEmail}`));
    }

  })

  //name input display
  reviewFormTextData.filter((itm) => {
    if (itm.reviewFormText.nameType === 'hidden') {
      NameLabel.style.display = 'none';
      NameInput.style.display = 'none';
      NameInput.setAttribute('isRequired', false)

    }
    else if (itm.reviewFormText.nameType === 'optional') {
      NameInput.setAttribute('isRequired', false)
    }
    else {
      NameLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.authorName}`));

    }
  })

  //location input display
  reviewFormTextData.filter((itm) => {
    if (itm.reviewFormText.locationType === 'hidden') {
      LocationLabel.style.display = 'none';
      locationInput.style.display = 'none';
      locationErr.style.display = 'none';
      locationInput.setAttribute('isRequired', false)

    }
    else if (itm.reviewFormText.locationType === 'optional') {
      locationInput.setAttribute('isRequired', false)
    }
    else {
      LocationLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.authorLocation}`));

    }
  })



  //name input display 
  RatingLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewRating}`));
  reviewTitleLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewTitle}`));
  reviewDescLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewBody}`));
  FormTitle.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewFormTitle}`));
  submitButtonTitle.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.submitButtton}`));
  SuccessMessage.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.successMessage}`));


}

// mapping function for all reviews

function dataDistructure(data) {
  let html = '';
  data.forEach(obj => {
    html += createHTMLForObject(obj);
  });
  return html;
}

// creating html for review list

function createHTMLForObject(itm) {
  let stars = [1, 2, 3, 4, 5];
  return `
<div id='review-list-section'>
<hr/>
<div class='rating' >
${stars.map((star) => {
    if (itm?.starRating >= star) {
      return `
      <a href="#" class="review-list-star" >&#9733</a>
      `
    }
    else {
      return `
      <a href="#" >&#9733</a>
      `
    }
  }).join('')
    }

    </div>
    <h3 id='review-title-list' class='spr' > ${itm?.reviewTitle} </h3>
    <p><i><b>${itm?.userName} </b> on <b>${formatDate(itm?.datePosted)}</b></i></p>
    <p id='review-list-description'> ${itm.reviewDescription} </p>
    <a href='#' id='report-review' style="color:#28282ABF"> </a>
    <br>
    ${itm?.reply === '' || itm.reply === null ?
      ''
      :
      `<div id='reply-box'>
          <p> ${itm?.reply} </p>
          <p id='reply-from'> - admin reply </p>
       </div>`
    }

</div>`

}

// date format for review list 
function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}

let currentRating = 0;

function handleButtonClick(e) {
  document.getElementById('form-section').style.display = 'block'
  document.getElementById('submit-message').style.display = 'none'


  e.preventDefault();
}



// on submit validaiton 
function handleSubmit(e, id, shop, product) {
  e.preventDefault();
  let stars = [1, 2, 3, 4, 5]
  let isEmailValid = false;
  let isLocationValid = false;
  let isNameValid = false;
  let isTitleValid = false;
  let isBodyValid = false;
  let nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^\S+@\S+\.\S+$/;
  const name = document.getElementById('nameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  const location = document.getElementById('locationInput').value.trim();
  const reviewTitle = document.getElementById('reviewTitleInput').value.trim();
  const reviewBody = document.getElementById('reviewBodyInput').value.trim();
  const ThankyouMessage = document.getElementById('submit-message')
  const Form = document.getElementById('form-section')
  const reviewLink = document.getElementById('write-review-link')
  const emailRequired = document.getElementById('emailInput').getAttribute('isRequired')
  const nameRequired = document.getElementById('nameInput').getAttribute('isRequired')
  const locationRequired = document.getElementById('locationInput').getAttribute('isRequired')

  if ((email.match(emailRegex)) && (email != '')) {
    isEmailValid = true;
  }
  else if (emailRequired == 'false') {
    isEmailValid = true;
  }
  else {
    isEmailValid = false;
  }


  if ((name.match(nameRegex)) && (name != '') && (name.length <= 25)) {
    isNameValid = true;
  }
  else if (nameRequired == 'false') {
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

  if ((location != '') && (location.length <= 1500)) {
    isLocationValid = true;

  }
  else if (locationRequired == 'false') {
    isLocationValid = true;


  }
  else {
    isLocationValid = false;
  }




  if (isNameValid === false || isTitleValid === false || isBodyValid === false || currentRating === 0 || isEmailValid === false || isLocationValid === false) {

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
    if (isLocationValid === false) {
      document.getElementById('locationErr').innerHTML = " Location must be between 1-1500!"
    }
    else {
      document.getElementById('locationErr').innerHTML = '';
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
      productHandle: product,
      location: location
    }

    addReviews(dataObj, shop);


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

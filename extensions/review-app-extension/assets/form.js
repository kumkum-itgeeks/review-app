
//global variables*********
let currentPage = 1;
var isthisLastPage;
var starsettingColor;
var shopName;
 let PageNumber = document.getElementById('page-number-display').value;
const URL = `https://games-showtimes-patch-substances.trycloudflare.com`

// dom content loaded********

document.addEventListener('DOMContentLoaded', function () {
  const stars = document.querySelectorAll('.star-rating .star');
 
  PageNumber = 1;

  stars.forEach(star => {
    star.addEventListener('mouseenter', function () {
      const rating = this.getAttribute('data-rating');
      stars.forEach(s => {
        if (s.getAttribute('data-rating') <= rating) {
          s.classList.add('active');
          s.style.color=starsettingColor;
          s.style.opacity = '1';
        } else {
          s.style.opacity = '0.5';
           // Fading effect for unselected stars on hover
        }
      });
    });

    star.addEventListener('mouseleave', function () {
      if (currentRating !== 0) {
        stars.forEach(s => {
          if (s.getAttribute('data-rating') <= currentRating) {
            s.classList.add('active');
            s.style.color=starsettingColor;
            s.style.opacity = '1';
          } else {
            s.classList.remove('active');
            s.style.color='#ccc';
            s.style.opacity = '0.5'; // Fading effect for unselected stars after click
          }
        });
      } else {
        stars.forEach(s => {
          s.classList.remove('active');
          s.style.opacity = '1';
          s.style.color='#ccc'; // Restore opacity for all stars after mouseleave
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
          s.style.color=starsettingColor;
          s.style.opacity = '1';
        } else {
          s.classList.remove('active');
          s.style.color='#ccc';
          s.style.opacity = '0.5'; // Fading effect for unselected stars after click
        }
      });
    });
  });
});


// sending formdata****


function addReviews(obj, shop , handle ,id) {

  fetch(`${URL}/api/addReviews/${JSON.stringify(obj)}/${JSON.stringify(shop)}/${JSON.stringify(handle)}/${id}`)
    .then(res => res.json())
    .then(data => console.log(data))

}

// checking if to show reviews on load**** (according to app setting)


function getOnloadReviewsSetting(shop, handle) {


  fetch(`${URL}/api/checkReviewsOnload/${JSON.stringify(shop)}`)
    .then(res => res.json())
    .then(data => {
      if (data === true) {
        console.log(data)
        document.getElementById('review-listing').style.display = 'block'
        document.getElementById('pagination-section').style.display = 'block'
        document.getElementById('review-count').style.textDecoration = 'none'
        document.getElementById('review-count').style.pointerEvents = 'none'
      }
      else {

        document.getElementById('review-listing').style.display = 'none'
        document.getElementById('pagination-section').style.display = 'none'

      }
      getReviews(shop, handle, PageNumber);
    }
    )
}

// changing functionality  based on onload function results *****

function changeReviewDisplay(e) {
  e.preventDefault();
  let display = document.getElementById('review-listing').style.display;
  if (display == 'block') {
    document.getElementById('review-listing').style.display = 'none';
    document.getElementById('pagination-section').style.display = 'none'

  }
  else {
    document.getElementById('review-listing').style.display = 'block';
    document.getElementById('pagination-section').style.display = 'flex'


  }
}

// get review list *****

function getReviews(shop, handle, page) {

  fetch(`${URL}/api/getReviews/${JSON.stringify(shop)}/${JSON.stringify(handle)}/${page}`)
    .then(res => res.json())
    .then(data => {
      setReviewInfo(data, shop)
    }
    )
}

// pagination functionality ********
function setPrev(shop,  handle, e) {
  e.preventDefault();
  console.log('prev')
  PageNumber == 1 ?
    document.getElementById('prev-btn').disabled = true
    :
    document.getElementById('prev-btn').disabled = false
  document.getElementById('next-btn').disabled = false

  PageNumber -= 1
  getReviews(shop, handle, PageNumber)


}

function setNext(shop, handle, e) {

  e.preventDefault();


  if (isthisLastPage) {
    document.getElementById('next-btn').disabled = true
  }
  else {
    document.getElementById('next-btn').disabled = false
    document.getElementById('prev-btn').disabled = false

    PageNumber = PageNumber + 1;
    getReviews(shop, handle, PageNumber)
  }

  console.log('page=>', PageNumber)
}

//report inappropriate review 

function reportReview(e, shop, id, reportText) {

  e.preventDefault();

  let targetID = document.getElementById(`target-id-${id}`);
  fetch(`${URL}/api/reportInappropriate/${JSON.stringify(shop)}/${id}`)
    .then(res => res.json())
    .then(data => {
      targetID.innerHTML = reportText
    }
    )
}


// fetching app setting data *******

function getSettingsData(shop) {

  fetch(`https://finances-bus-stand-calculator.trycloudflare.com/api/getSettingsData/${JSON.stringify(shop)}`)
    .then(res => res.json())
    .then(data => setSettings(data)
    )
}


const setReviewInfo = (data, shop) => {

  let stars = [1, 2, 3, 4, 5];
 
  document.getElementById('review-listing').innerHTML = dataDistructure(data, shop),
    document.getElementById('average-rating').innerHTML = `<div class='rating' >${stars.map((star) => {
      return data.averageRating >= star ? '<a href="#" class="review-list-star">&#9733;</a>' : 
      Number(data.averageRating) + 0.5 >= star ? '<a href="#" id="half-stars">&#9733;</a>':
      '<a href="#">&#9733;</a>';
    }).join('')}<div class='rating' >`;

  setSettings(data);


}

// setting all setting's values**********

function setSettings(data) {

  //star settings**
  const { settingData, length, reviews, averageRating, isLastPage } = data;

  const isInappropriateReview = reviews.map((itm) => itm.isInappropriate)
  isthisLastPage = isLastPage;

  starColorData = settingData.filter((itm) => (itm.starIconColor))
  let star = document.getElementsByClassName('review-list-star');
  let ratingStar = document.querySelectorAll('.star');
  let halfStars = document.getElementById('half-stars')
  halfStars?.style.setProperty('--star-color', (starColorData.map((itm) => itm.starIconColor.customColor)));

  starsettingColor=(starColorData[0].starIconColor.customColor)

  for (var i = 0; i < star.length; i++) {
    star[i].style.color = (starColorData.map((itm) => itm.starIconColor.customColor));

  }

  //review listing layout**

  let reviewListingData = settingData.filter((itm) => (itm.reviewListingLayout))
  let reviewSection = document.getElementById('review-section');
  let divider = document.getElementsByTagName('hr');

  reviewSection.style.borderColor = (reviewListingData.map((itm) => itm.reviewListingLayout.bordercolor));
  reviewSection.style.padding = (reviewListingData.map((itm) => `${itm.reviewListingLayout.reviewListingPadding}px`));

  for (var i = 0; i < divider.length; i++) {
    divider[i].style.backgroundColor = (reviewListingData.map((itm) => itm.reviewListingLayout.dividercolor));

  }

  //review listing text**
  let reviewListingTextData = settingData.filter((itm) => (itm.reviewListingText));
  let reviewHeadline = document.getElementById('review-headline');
  let reviewLink = document.getElementById('review-link-title');
  let noReviewTitle = document.getElementById('no-review-title');
  let reviewCountTitle = document.getElementById('review-count-title');
  let NextButton = document.getElementById('next-btn')
  let PrevButton = document.getElementById('prev-btn')

  //storing label values
  reviewHeadline.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.reviewHeadline}`));
  reviewLink.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.reviewLink}`));
  NextButton.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.paginationNextLabel}`));
  PrevButton.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.paginationPrevLabel}`));

  //setting review count title based on reviews availble or not (eg: 'based on 4 reviews' or no reviews yet)
  length ?
    reviewCountTitle.innerText = reviewListingTextData.map((itm) => `${(itm.reviewListingText.reviewSummary)}`.replaceAll("${length}", `${length}`)) :
    noReviewTitle.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.noReviewSummary}`));


  //showing review either reported or can report
  reviews.map((itm) => {
    if (itm.isInappropriate === 1) {
      document.getElementById(`target-id-${itm.id}`).innerHTML = reviewListingTextData.map((itm) => `${itm.reviewListingText.reportAsinappropriateMessage}`)
    }
    else {
      document.getElementById(`target-id-${itm.id}`).innerHTML = reviewListingTextData.map((itm) => `${itm.reviewListingText.reportAsinappropriate}`)

    }
  })

  // review form text** 

  let reviewFormTextData = settingData.filter((itm) => (itm.reviewFormText));
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
  let commonErr = document.getElementById('common-err')

  //common error box
  commonErr.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.errorMessage}`));

  //setting input values 
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

  //Input display (hidden or required or optional)**

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



  //setting label values
  RatingLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewRating}`));
  reviewTitleLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewTitle}`));
  reviewDescLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewBody}`));
  FormTitle.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewFormTitle}`));
  submitButtonTitle.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.submitButtton}`));
  SuccessMessage.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.successMessage}`));


}


// mapping function for all reviews** (distributing objects from array )

function dataDistructure(data, shop) {
  const { reviews } = data;
  let html = '';
  reviews.forEach(obj => {
    html += createHTMLForObject(data, obj, shop);
  });
  return html;
}


// generating html for review list (block for each review )

function createHTMLForObject(data, itm, shop) {
  let reviewListingData = (data.settingData.filter((itm) => itm.reviewListingText))
  let authorInformation = (reviewListingData[0].reviewListingText.authorInformation)
  let reportedText = (reviewListingData[0].reviewListingText.reportAsinappropriateMessage)
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
    ${(authorInformation).replace('${itm.userName}', itm?.userName).replace('${itm.datePosted}', formatDate(itm?.datePosted))}
    <p id='review-list-description'> ${itm.reviewDescription} </p>
    <div class='report-section'>
    <a href='#' class='report-review' id='target-id-${itm.id}' style="color:#28282ABF" onclick="reportReview(event,'${shop}',${itm.id} , '${reportedText}' )"> 
    </a>
    </div>
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

// date format for review list*** (eg: Mar 25 , 2024)
function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}

let currentRating = 0;

function handleButtonClick(e) {

  e.preventDefault();
  document.getElementById('submit-message').style.display = 'none';
  let FormDisplay = document.getElementById('form-section').style.display;

  if (FormDisplay == 'block') {
    document.getElementById('form-section').style.display = 'none';
  }
  else {
    document.getElementById('form-section').style.display = 'block';
  }


}



// on submit validaiton (on click of submit button only)
function handleSubmit(e, id, shop, product , handle) {
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
  let commonErr = document.getElementById('common-err')


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


  //showing red lines for error fields and black for no err

  if (isNameValid === false || isTitleValid === false || isBodyValid === false || currentRating === 0 || isEmailValid === false || isLocationValid === false) {

    commonErr.style.display = 'block';

    if (isNameValid === false) {
      document.getElementById('nameInput').style.borderColor = "red"
      document.getElementById('nameInput').style.borderWidth = "2px"
    }
    else {
      document.getElementById('nameInput').style.borderColor = "black"
      document.getElementById('nameInput').style.borderWidth = "1px"

    }
    if (isEmailValid === false) {
      document.getElementById('emailInput').style.borderColor = "red"
      document.getElementById('emailInput').style.borderWidth = "2px"
    }
    else {
      document.getElementById('emailInput').style.borderColor = "black"
      document.getElementById('emailInput').style.borderWidth = "1px"

    }

    if (isTitleValid === false) {
      document.getElementById('reviewTitleInput').style.borderColor = "red"
      document.getElementById('reviewTitleInput').style.borderWidth = "2px"
    }
    else {
      document.getElementById('reviewTitleInput').style.borderColor = "black"
      document.getElementById('reviewTitleInput').style.borderWidth = "1px"

    }
    if (isBodyValid === false) {
      document.getElementById('reviewBodyInput').style.borderColor = "red"
      document.getElementById('reviewBodyInput').style.borderWidth = "2px"
    }
    else {
      document.getElementById('reviewBodyInput').style.borderColor = "black"
      document.getElementById('reviewBodyInput').style.borderWidth = "1px"

    }
    if (isLocationValid === false) {
      document.getElementById('locationInput').style.borderColor = "red"
      document.getElementById('locationInput').style.borderWidth = "2px"
    }
    else {
      document.getElementById('locationInput').style.borderColor = "black"
      document.getElementById('locationInput').style.borderWidth = "1px"

    }
    if (currentRating === 0) {
      document.getElementById('ratingErr').innerHTML = "*"
    }
    else {
      document.getElementById('ratingErr').innerHTML = '';
    }


  } else {

    //common red error box on top
    commonErr.style.display = 'none';

    document.getElementById('ratingErr').innerHTML = ''


    //  submiting form data**

    const dataObj = {
      reviewTitle: reviewTitle,
      reviewDescription: reviewBody,
      userName: name,
      StarRating: currentRating,
      Email: email,
      productid: id,
      productHandle: handle,
      productTitle: product,
      location: location
    }

    //api function for adding formdata **
    addReviews(dataObj, shop , handle , id);


    //thanks you message after submitting form **
    ThankyouMessage.style.display = 'block';

    //removing all errors from fields
      var errorMessages = document.getElementsByClassName('input-box');
      for (var i = 0; i < errorMessages.length; i++) {
          errorMessages[i].style.borderColor = 'black';
          errorMessages[i].style.borderWidth = "1px"
      }

    //removing form display after submit (can be visible after click on write review)**
    Form.style.display = 'none';
    reviewLink.display = 'none'

    //emptying input boxes**
    var inputBoxes = document.getElementsByClassName('input-box');
    for (var i = 0; i < inputBoxes.length; i++) {
      inputBoxes[i].value = '';
    }

    var errorMessages = document.getElementsByClassName('input-box');
    for (var i = 0; i < errorMessages.length; i++) {
      errorMessages[i].style.borderColor = 'black';
      errorMessages[i].style.borderWidth = "1px"
    }
    //setting rating to 0 again 
    currentRating = 0;
    document.getElementById('ratingErr').innerHTML = ''

    let mystar=document.querySelectorAll('.star')


    mystar.forEach((s) => {
     s.style.color='#ccc'
    })

  }
}

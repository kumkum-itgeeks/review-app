
//variables
// let starIconColor= {};


// console.log(starIconColor)

function addReviews(obj, shop) {

  fetch(`https://finances-bus-stand-calculator.trycloudflare.com/api/addReviews/${JSON.stringify(obj)}/${JSON.stringify(shop)}`)
    .then(res => res.json())
    .then(data => console.log(data))

}

function getReviews(shop, pid) {

  fetch(`https://finances-bus-stand-calculator.trycloudflare.com/api/getReviews/${JSON.stringify(shop)}/${pid}`)
    .then(res => res.json())
    .then(data => {
      setReviewInfo(data)
    }
    )
}
function getOnloadReviewsSetting(shop, pid) {

  fetch(`https://finances-bus-stand-calculator.trycloudflare.com/api/checkReviewsOnload/${JSON.stringify(shop)}`)
    .then(res => res.json())
    .then(data => {
      if (data===true) {
        console.log(data)
        document.getElementById('review-listing').style.display = 'block'
        document.getElementById('review-count').style.textDecoration = 'none'
        document.getElementById('review-count').style.pointerEvents = 'none'
      }
      else {

        document.getElementById('review-listing').style.display = 'none'
      }
      getReviews(shop, pid);
    }
    )
}

function changeReviewDisplay(e) {
  e.preventDefault();
  let display = document.getElementById('review-listing').style.display;
  console.log('herere', display)
  if (display == 'block') {

    document.getElementById('review-listing').style.display = 'none';
  }
  else {
    document.getElementById('review-listing').style.display = 'block';
  }
}


function getSettingsData(shop) {

  fetch(`https://finances-bus-stand-calculator.trycloudflare.com/api/getSettingsData/${JSON.stringify(shop)}`)
    .then(res => res.json())
    .then(data => setSettings(data)
    )
}



function setSettings(data) {

  //star settings
  const { settingData, length, reviews, averageRating } = data;



  starColorData = settingData.filter((itm) => (itm.starIconColor))
  let star = document.getElementsByClassName('review-list-star');
  let ratingStar = document.querySelectorAll('.star.active');

  for (var i = 0; i < ratingStar.length; i++) {
    ratingStar[i].style.color = (starColorData.map((itm) => itm.starIconColor.customColor));
  }

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

  reviewHeadline.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.reviewHeadline}`));
  reviewLink.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.reviewLink}`));
  length ?
    reviewCountTitle.innerText = reviewListingTextData.map((itm) => `${itm.reviewListingText.reviewSummary}`) :
    noReviewTitle.innerHTML = (reviewListingTextData.map((itm) => `${itm.reviewListingText.noReviewSummary}`));


  // review form text 

  let reviewFormTextData = settingData.filter((itm) => (itm.reviewFormText));
  console.log(reviewFormTextData)
  let EmailPlaceholderValue = (reviewFormTextData.map((itm) => `${itm.reviewFormText.emailHelpMessage}`));
  let NamePlaceholderValue = (reviewFormTextData.map((itm) => `${itm.reviewFormText.nameHelpMessage}`));
  let reviewTitlePlaceholderValue = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewTitleHelpMessage}`));
  let reviewBodyPlaceholderValue = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewBodyHelpMessage}`));

  let FormTitle = document.getElementById('review-form-title');
  let submitButtonTitle = document.getElementById('submit-btn-title');
  let SuccessMessage = document.getElementById('success-message');

  let EmailLabel = document.getElementById('email-label');
  document.getElementById('emailInput').setAttribute("placeholder", EmailPlaceholderValue);

  let NameLabel = document.getElementById('name-label');
  document.getElementById('nameInput').setAttribute("placeholder", NamePlaceholderValue);

  let RatingLabel = document.getElementById('rating-label');

  let reviewTitleLabel = document.getElementById('review-title-label');
  document.getElementById('reviewTitleInput').setAttribute("placeholder", reviewTitlePlaceholderValue);

  let reviewDescLabel = document.getElementById('review-desc-label');
  document.getElementById('reviewBodyInput').setAttribute("placeholder", reviewBodyPlaceholderValue);


  EmailLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.authorEmail}`));
  NameLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.authorName}`));
  RatingLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewRating}`));
  reviewTitleLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewTitle}`));
  reviewDescLabel.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewBody}`));
  FormTitle.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.reviewFormTitle}`));
  submitButtonTitle.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.submitButtton}`));
  SuccessMessage.innerHTML = (reviewFormTextData.map((itm) => `${itm.reviewFormText.successMessage}`));




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

function dataDistructure(data) {
  let html = '';
  data.forEach(obj => {
    html += createHTMLForObject(obj);
  });
  return html;
}


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

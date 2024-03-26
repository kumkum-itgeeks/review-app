import React, { useState, useCallback, useEffect } from 'react'
import { TitleBar } from '@shopify/app-bridge-react'
import {
  BlockStack, Box, Divider, InlineStack, Page, Text, Grid, RadioButton, Checkbox
  , ColorPicker, TextField, Button, Tooltip, Popover, Select, DataTable
} from '@shopify/polaris'
import { useAuthenticatedFetch } from '../hooks';
import {Modal , useToast} from '@shopify/app-bridge-react';

export default function Settings() {

  const [starValue, setStarValue] = useState('themecolor');
  const [checked, setChecked] = useState(false);
  const [showReviewChecked, setShowReviewChecked] = useState(true);
  const [email, setEmail] = useState('your@gmail.com')
  const [popoverActive, setPopoverActive] = useState(false);
  const [popoverActiveStar, setPopoverActiveStar] = useState(false);
  const [popoverActiveDivider, setPopoverActiveDivider] = useState(false);
  const [starRgb, setStarRgb] = useState('#D3D3D3');
  const [borderRgb, setBorderRgb] = useState('#D3D3D3');
  const [divierRgb, setDividerRgb] = useState('#D3D3D3');
  const [formData, setFormData] = useState([]);
  const [isModalOpen , setIsModalOpen]=useState(false)


  const [color, setColor] = useState({  //star icon color state
    hue: 120,
    brightness: 1,
    saturation: 1,
  });

  const [borderColor, setBorderColor] = useState({ //border color state
    hue: 120,
    brightness: 1,
    saturation: 1,
  });

  const [dividerColor, setDividerColor] = useState({ //divider color state
    hue: 120,
    brightness: 1,
    saturation: 1,
  });

  const [AutopublishSetting, setAutopublishSetting] = useState(
    { autopublish: 'enabled' }); //for autopublish setting


  const [emailSetting, setEmailSetting] = useState({  // for email settings
    sendEmail: checked,
    email: email
  })

  const [starIconColor, setStarIconColor] = useState({ //star icon setting
    isThemeColor: starValue,
    customColor: starRgb
  })

  const [reviewListingLayout, setReviewListingLayout] = useState({ // review Listing layout setting
    reviewOnload: showReviewChecked,
    bordercolor: borderRgb,
    dividercolor: divierRgb,
    reviewListingPadding: '24',
    reviewPerpage: '4'
  })

  const [reviewListingText, setreviewListingText] = useState({  // for review listing text setting
    reviewHeadline: 'Customer Reviews',
    reviewLink: 'Write a review',
    noReviewSummary: 'No reviews yet',
    reviewSummary: "Based on {{product.reviews_count}} {{ product.reviews_count | pluralize: 'review', 'reviews' }}",
    paginationNextLabel: 'Next &raquo;',
    paginationPrevLabel: '&laquo; Previous',
    reportAsinappropriate: 'Report as Inappropriate',
    reportAsinappropriateMessage: 'This review has been reported',
    authorInformation: "<strong>{{ review.author }}</strong> on <strong>{{ review.created_at | date: '%b %d, %Y' }}</strong>"
  })

  const [reviewFormText, setReviewFormText] = useState({ // for review form text setting 
    authorEmail: 'Email',
    emailHelpMessage: 'john.smith@example.com',
    emailType: 'required',
    authorName: 'Name',
    nameHelpMessage: 'Enter your name',
    nameType: 'required',
    authorLocation: '',
    locationHelpMessage: '',
    locationType: 'required',
    reviewFormTitle: 'Write a review',
    reviewRating: 'Rating',
    reviewTitle: 'Review Title',
    reviewTitleHelpMessage: 'Give your review a title',
    reviewBody: 'Body of Review',
    reviewBodyHelpMessage: 'Write your comments here',
    submitButtton: 'Submit Review',
    successMessage: 'Thank you for submitting a review!',
    errorMessage: 'Not all the fields have been filled out correctly!',
  })

  const [BadgeText, setBadgeText] = useState({ // for badge text setting 
    noReviewsBadge: 'No reviews',
    reviewsBadge: "{{product.reviews_count}} {{ product.reviews_count | pluralize: 'review', 'reviews' }}"
  })


  //******** variables********

  const {show} = useToast();
  let type = ['autopublish', 'emailSettings', 'starIconColor', 'reviewListingLayout', 'reviewListingText', 'reviewFormText', 'badgeText']
  let data = [{ type: 'autopublish', setting: AutopublishSetting },
  { type: 'emailSettings', setting: emailSetting },
  { type: 'starIconColor', setting: starIconColor },
  { type: 'reviewListingLayout', setting: reviewListingLayout },
  { type: 'reviewListingText', setting: reviewListingText },
  { type: 'reviewFormText', setting: reviewFormText },
  { type: 'badgeText', setting: BadgeText }
  ]

  let dataObj = {};
  type.forEach((key, index) => {
    dataObj[key] = data[index];
  });

  const fetch = useAuthenticatedFetch();
  const emailTypeoptions = [
    { label: 'Required', value: 'required' },
    { label: 'Optional', value: 'optional' },
    { label: 'Hidden', value: 'hidden' },
  ];

  const nameTypeoptions = [
    { label: 'Required', value: 'required' },
    { label: 'Optional', value: 'optional' },
    { label: 'Hidden', value: 'hidden' },
  ];

  const locationTypeoptions = [
    { label: 'Required', value: 'required' },
    { label: 'Optional', value: 'optional' },
    { label: 'Hidden', value: 'hidden' },
  ];

  //********useEffects********

  useEffect(() => {
    getSettings()
  }, [])

  useEffect(() => {
    setStarRgb(convertToHex(color))
    handleStarColorSetting('customColor', starRgb)

    setBorderRgb(convertToHex(borderColor))
    handleReviewListing('bordercolor', borderRgb)

    setDividerRgb(convertToHex(dividerColor))
    handleReviewListing('dividercolor', divierRgb)
  }, [color, borderColor, dividerColor,])



  useEffect(() => {
    const arr = formData?.map((itm) => (itm))
    arr.map((arr) => {

      if (Object.keys(arr) == 'emailSettings') {
        setEmailSetting(arr.emailSettings)
      }
      if (Object.keys(arr) == 'autopublish') {
        setAutopublishSetting(arr.autopublish)
      }
      if (Object.keys(arr) == 'starIconColor') {
        setStarIconColor(arr.starIconColor)
      }
      if (Object.keys(arr) == 'reviewListingLayout') {
        setReviewListingLayout(arr.reviewListingLayout)
      }
      if (Object.keys(arr) == 'reviewListingText') {
        setreviewListingText(arr.reviewListingText)
      }
      if (Object.keys(arr) == 'reviewFormText') {
        setReviewFormText(arr.reviewFormText)
      }
      if (Object.keys(arr) == 'badgeText') {
        setBadgeText(arr.badgeText)
      }
    })

  }, [formData])


  //********functions********* 

  const saveSettings = () => {

    fetch('/api/settings/saveSettings', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data }),
    })
      .then(res => res.json())
      .then(data => {show('settings saved!', {duration: 2000})});

  }

  const getSettings = () => {

    fetch(`/api/settings/getSettings`)
      .then(res => res.json())
      .then(data => setFormData(data))
  }
  const resetSettings = () => {

    fetch(`/api/settings/resetSettings`)
      .then(res => res.json())
      .then(data => {setFormData(data),show(' successfully reset setting!', {duration: 2000})})
  }

  const test = () => {

    fetch(`/api/table/createSettingsTable`)
      .then(res => res.json())
      .then(data => console.log(data))
  }

  const test2 = () => {
    fetch('/api/settings/addSettingsData', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data }),
    })
      .then(res => res.json())
      .then(data => console.log((data)));
  }

  const convertToHex = ({ hue, saturation, brightness }) => {
    const hsbToRgb = (h, s, v) => {
      let r, g, b;
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
        default:
          break;
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    const [red, green, blue] = hsbToRgb(hue / 360, saturation, brightness);
    // const alphaValue = Math.round(alpha * 255).toString(16).padStart(2, '0');
    const redHex = red.toString(16).padStart(2, '0');
    const greenHex = green.toString(16).padStart(2, '0');
    const blueHex = blue.toString(16).padStart(2, '0');

    return `#${redHex}${greenHex}${blueHex}`;
  };




  // popover funcitons
  const togglePopoverActive = useCallback(  //color picker for border color 
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );
  const togglePopoverActiveDivider = useCallback(  //color picker for divider
    () => setPopoverActiveDivider((popoverActive) => !popoverActive),
    [],
  );
  const togglePopoverActiveStar = useCallback( //color picker for star icon
    () => setPopoverActiveStar((popoverActive) => !popoverActive),
    [],
  );

  //*********data setting functions******

  const handleAutopublish = useCallback(
    (_, newValue) => handleAutopublishSetting('autopublish', newValue),
    [],
  );


  const handleAutopublishSetting = (field, value) => {
    setAutopublishSetting((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleEmailSetting = (field, value) => {
    setEmailSetting((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleStarColorSetting = (field, value) => {
    setStarIconColor((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleStarSetting = useCallback(
    (_, newValue) => {
      setStarValue(newValue)
      handleStarColorSetting('isThemeColor', newValue)
    },
    [],
  );

  const handleReviewListing = (field, value) => {
    setReviewListingLayout((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handlereviewListingText = (field, value) => {
    setreviewListingText((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handlereviewFormText = (field, value) => {
    setReviewFormText((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleBadgeText = (field, value) => {
    setBadgeText((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };


  const handleCheck = useCallback(  // email checkbox 
    (newChecked) => {
      setChecked(newChecked),
        handleEmailSetting('sendEmail', newChecked)
    },
    [],
  );

  const showReviewCheck = useCallback( // review onload notification checkbox
    (newChecked) => {
      setShowReviewChecked(newChecked)
      handleReviewListing('reviewOnload', newChecked)
    },
    [],

  );
  const handeEmailtoSend = useCallback(
    (newChecked) => {
      setEmail(newChecked)
      handleEmailSetting('email', newChecked)
    },
    [],

  );

  const setBorderColorfunction = useCallback(
    (newValue) => {
      setBorderColor(newValue)
    },
    [],
  );

  const setStarColorfunction = useCallback(
    (newValue) => {
      setColor(newValue)
    },
    [],
  );

  const setDividerColorfunction = useCallback(
    (newValue) => {
      setDividerColor(newValue)

    },
    [],

  );


  //******** data variables*********

  const activator = (
    <Button onClick={togglePopoverActive}  >
      color
    </Button>
  );

  const activatordivider = (
    <Button onClick={togglePopoverActiveDivider}  >
      color
    </Button>
  );

  const activatorStar = (
    <Button onClick={togglePopoverActiveStar}  >
      color
    </Button>
  );

// console.log(isModalOpen)

  return (
    <>
      <Page >
        <BlockStack gap={400}>
          {/* 1 autopublish setting  */}
          <BlockStack gap={400}>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }} >
                <Box padding={400} >
                  <BlockStack gap={400} align='center'>
                    <Text variant='headingMd' as='h6'> Autopublish</Text>
                    <Text variant='bodyLg' as='p'> Automatically check new reviews for spam and then publish them.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={300}>
                    <RadioButton
                      label="Enabled"
                      helpText="Customers will only be able to check out as guests."
                      checked={AutopublishSetting.autopublish === 'enabled'}
                      id="enabled"
                      name="accounts"
                      onChange={handleAutopublish}
                    />
                    <RadioButton
                      label="Disabled"
                      helpText="You must manually publish new reviews."
                      id="disabled"
                      name="accounts"
                      checked={AutopublishSetting.autopublish === 'disabled'}
                      onChange={handleAutopublish}
                    />
                  </BlockStack>
                </Box>
              </Grid.Cell>
            </Grid>
            <Divider borderColor="border" />
          </BlockStack>

          {/* 2 email setting  */}

          <BlockStack gap={400}>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }} >
                <Box padding={400} >
                  <BlockStack gap={400} align='center'>
                    <Text variant='headingMd' as='h6'> Email setting</Text>
                    <Text variant='bodyLg' as='p'> Choose if you want to receive email notifications for each review</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={300}>
                    <Checkbox
                      label="Send me an email when a review is submitted."
                      checked={emailSetting.sendEmail}
                      onChange={handleCheck}
                    />
                    {
                      checked ?
                        <TextField
                          label="Email"
                          type="email"
                          value={emailSetting.email}
                          onChange={handeEmailtoSend}
                          autoComplete="off"
                        />
                        : ''
                    }
                  </BlockStack>
                </Box>
              </Grid.Cell>
            </Grid>
            <Divider borderColor="border" />
          </BlockStack>

          {/* 3 star icon setting  */}
          <BlockStack gap={400}>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }} >
                <Box padding={400} >
                  <BlockStack gap={400} align='center'>
                    <Text variant='headingMd' as='h6'> Star icon color</Text>
                    <Text variant='bodyLg' as='p'> Customize the color of your star icons.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={300}>
                    <RadioButton
                      label="Theme color"
                      helpText="Icons get their color from your theme."
                      checked={starIconColor.isThemeColor === 'themecolor'}
                      id="themecolor"
                      name="star"
                      onChange={handleStarSetting}
                    />
                    <RadioButton
                      label="Custom color"
                      helpText="Icons are a custom color."
                      id="customcolor"
                      name="star"
                      checked={starIconColor.isThemeColor === 'customcolor'}
                      onChange={handleStarSetting}
                    />
                    {
                      starValue == 'customcolor' ?
                        <Popover
                          active={popoverActiveStar}
                          activator={activatorStar}
                          autofocusTarget="first-node"
                          onClose={togglePopoverActiveStar}
                        >
                          <ColorPicker  onChange={setStarColorfunction} color={starIconColor.customColor} />
                        </Popover>
                        : ''
                    }
                  </BlockStack>
                </Box>
              </Grid.Cell>
            </Grid>
            <Divider borderColor="border" />
          </BlockStack>


          {/* 4 review listing layout setting */}
          <BlockStack gap={400}>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }} >
                <Box padding={400} >
                  <BlockStack gap={400} align='center'>
                    <Text variant='headingMd' as='h6'> Review listing layout</Text>
                    <Text variant='bodyLg' as='p'> Customize how your review listing looks and feels.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={300}>
                    <Checkbox
                      label="Show reviews on load"
                      checked={reviewListingLayout.reviewOnload}
                      onChange={showReviewCheck}
                    />
                    <Text>The reviews for products will be visible for all users by default.</Text>
                    <Divider />

                    <Popover
                      active={popoverActive}
                      activator={activator}
                      autofocusTarget="first-node"
                      onClose={togglePopoverActive}
                    >
                      <ColorPicker  onChange={setBorderColorfunction} color={reviewListingLayout.bordercolor} />
                    </Popover>

                    <Text>Border color</Text>

                    <Popover
                      active={popoverActiveDivider}
                      activator={activatordivider}
                      autofocusTarget="first-node"
                      onClose={togglePopoverActiveDivider}
                    >
                      <ColorPicker  onChange={setDividerColorfunction} color={reviewListingLayout.dividercolor} />

                    </Popover>
                    <Text>Divider color</Text>

                    <TextField
                      label="Padding"
                      type="number"
                      value={reviewListingLayout.reviewListingPadding}
                      onChange={(value) => handleReviewListing('reviewListingPadding', value)}
                      autoComplete="off"
                    />

                    <TextField
                      label="Reviews per page (Value between 2 and 100)"
                      type="number"
                      value={reviewListingLayout.reviewPerpage}
                      onChange={(value) => handleReviewListing('reviewPerpage', value)}
                      autoComplete="off"
                    />
                  </BlockStack>
                </Box>
              </Grid.Cell>
            </Grid>
            <Divider borderColor="border" />
          </BlockStack>

          {/* 5 review listing text setting  */}

          <BlockStack gap={400}>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }} >
                <Box padding={400} >
                  <BlockStack gap={400} align='center'>
                    <Text variant='headingMd' as='h6'>Review listing text</Text>
                    <Text variant='bodyLg' as='p'>Customize the text for the area that reviews are displayed on your website.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={400}>
                    <TextField
                      label="Review headline"
                      type="text"
                      value={reviewListingText.reviewHeadline}
                      onChange={(value) => handlereviewListingText('reviewHeadline', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Write a review link"
                      type="text"
                      value={reviewListingText.reviewLink}
                      onChange={(value) => handlereviewListingText('reviewLink', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Review summary with no reviews"
                      type="text"

                      value={reviewListingText.noReviewSummary}
                      onChange={(value) => handlereviewListingText('noReviewSummary', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Review summary with 1 or more reviews"
                      type="text"

                      value={reviewListingText.reviewSummary}
                      onChange={(value) => handlereviewListingText('reviewSummary', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Pagination 'next' label"
                      type="text"

                      value={reviewListingText.paginationNextLabel}
                      onChange={(value) => handlereviewListingText('paginationNextLabel', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Pagination 'previous' label"
                      type="text"

                      value={reviewListingText.paginationPrevLabel}
                      onChange={(value) => handlereviewListingText('paginationPrevLabel', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Report as inappropriate"
                      type="text"

                      value={reviewListingText.reportAsinappropriate}
                      onChange={(value) => handlereviewListingText('reportAsinappropriate', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Reported as inappropriate message"
                      type="text"

                      value={reviewListingText.reportAsinappropriateMessage}
                      onChange={(value) => handlereviewListingText('reportAsinappropriateMessage', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Author information"
                      type="text"

                      multiline={4}
                      value={reviewListingText.authorInformation}
                      onChange={(value) => handlereviewListingText('authorInformation', value)}
                      autoComplete="off"
                    />

                  </BlockStack>
                </Box>
              </Grid.Cell>
            </Grid>
            <Divider borderColor="border" />
          </BlockStack>

          {/* 6 review form text  setting  */}
          <BlockStack gap={400}>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }} >
                <Box padding={400} >
                  <BlockStack gap={400} align='center'>
                    <Text variant='headingMd' as='h6'>Review form text</Text>
                    <Text variant='bodyLg' as='p'>Customize the text, and which fields are shown for the new review form.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={300}>
                    <TextField
                      label="Author's email"
                      type="text"
                      value={reviewFormText.authorEmail}
                      onChange={(value) => handlereviewFormText('authorEmail', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Help message"
                      type="text"
                      value={reviewFormText.emailHelpMessage}
                      onChange={(value) => handlereviewFormText('emailHelpMessage', value)}
                      autoComplete="off"
                    />

                    <Select
                      label="Type"
                      options={emailTypeoptions}
                      onChange={(value) => handlereviewFormText('emailType', value)}
                      value={reviewFormText.emailType}
                    />

                    <Divider />

                    <TextField
                      label="Author's name"
                      type="text"
                      value={reviewFormText.authorName}
                      onChange={(value) => handlereviewFormText('authorName', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Help message"
                      type="text"
                      value={reviewFormText.nameHelpMessage}
                      onChange={(value) => handlereviewFormText('nameHelpMessage', value)}
                      autoComplete="off"
                    />

                    <Select
                      label="Type"
                      options={nameTypeoptions}
                      onChange={(value) => handlereviewFormText('nameType', value)}
                      value={reviewFormText.nameType}
                    />

                    <Divider />

                    <TextField
                      disabled
                      label="Author's location"
                      type="text"
                      value={reviewFormText.authorLocation}
                      onChange={(value) => handlereviewFormText('authorLocation', value)}
                      autoComplete="off"
                    />
                    <TextField
                      disabled
                      label="Help message"
                      type="text"
                      value={reviewFormText.locationHelpMessage}
                      onChange={(value) => handlereviewFormText('locationHelpMessage', value)}
                      autoComplete="off"
                    />

                    <Select
                      label="Type"
                      options={locationTypeoptions}
                      onChange={(value) => handlereviewFormText('locationType', value)}
                      value={reviewFormText.locationType}
                    />

                    <Divider />

                    <TextField
                      label="Review form title"
                      type="text"
                      value={reviewFormText.reviewFormTitle}
                      onChange={(value) => handlereviewFormText('reviewFormTitle', value)}
                      autoComplete="off"
                    />

                    <TextField
                      label="Review rating"
                      type="text"
                      value={reviewFormText.reviewRating}
                      onChange={(value) => handlereviewFormText('reviewRating', value)}
                      autoComplete="off"
                    />

                    <Divider />

                    <TextField
                      label="Review title"
                      type="text"
                      value={reviewFormText.reviewTitle}
                      onChange={(value) => handlereviewFormText('reviewTitle', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Help message"
                      type="text"
                      value={reviewFormText.reviewTitleHelpMessage}
                      onChange={(value) => handlereviewFormText('reviewTitleHelpMessage', value)}
                      autoComplete="off"
                    />

                    <Divider />

                    <TextField
                      label="Review body"
                      type="text"
                      value={reviewFormText.reviewBody}
                      onChange={(value) => handlereviewFormText('reviewBody', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Help message"
                      type="text"
                      value={reviewFormText.reviewBodyHelpMessage}
                      onChange={(value) => handlereviewFormText('reviewBodyHelpMessage', value)}
                      autoComplete="off"
                    />

                    <Divider />

                    <TextField
                      label="Submit button"
                      type="text"
                      value={reviewFormText.submitButtton}
                      onChange={(value) => handlereviewFormText('submitButtton', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Success message"
                      type="text"
                      value={reviewFormText.successMessage}
                      onChange={(value) => handlereviewFormText('successMessage', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Error message"
                      type="text"
                      value={reviewFormText.errorMessage}
                      onChange={(value) => handlereviewFormText('errorMessage', value)}
                      autoComplete="off"
                    />

                  </BlockStack>
                </Box>
              </Grid.Cell>
            </Grid>
            <Divider borderColor="border" />
          </BlockStack>

          {/* 7 badge text setting  */}
          <BlockStack gap={400}>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }} >
                <Box padding={400} >
                  <BlockStack gap={400} align='center'>
                    <Text variant='headingMd' as='h6'> Badge text</Text>
                    <Text variant='bodyLg' as='p'>Customize the text of the star rating badges by modifying the text fields.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={300}>
                    <TextField
                      label="Badge with no reviews"
                      type="text"
                      value={BadgeText.noReviewsBadge}
                      onChange={(value) => handleBadgeText('noReviewsBadge', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Badge with 1 or more reviews"
                      type="text"
                      value={BadgeText.reviewsBadge}
                      onChange={(value) => handleBadgeText('reviewsBadge', value)}
                      autoComplete="off"
                    />
                  </BlockStack>
                </Box>
              </Grid.Cell>
            </Grid>
            <Divider borderColor="border" />
          </BlockStack>


          <InlineStack gap={300} align='end'>
          <Modal 
          title="Reset all settings to default?" message="Are you sure ? you want to reset all settings to default? This action cannot be reversed." 
          open={isModalOpen}
          onClose={()=>setIsModalOpen(false)}
          size='Small' 
          primaryAction={{
            content:'Reset all settings' ,
            onAction:()=>{resetSettings(),setIsModalOpen(false)}
            }}
          secondaryActions={[
            {content:'cancel',
            onAction:()=>setIsModalOpen(false)
           }
          ]}
             />
             {/* <Toast content="Success!" duration={2000}/> */}
            <Button size='large' onClick={()=>setIsModalOpen(true)}> Reset all settings to default</Button>
            <Button size='large'> Export deleted reviews</Button>
            <Button size='large' onClick={() => saveSettings()}> Save </Button>
          </InlineStack>
        </BlockStack>
      </Page>
    </>
  )
}

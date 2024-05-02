import React, { useState, useCallback, useEffect, useContext } from 'react'
import { TitleBar } from '@shopify/app-bridge-react'
import {
  BlockStack, Box, Divider, InlineStack, Page, Text, Grid, RadioButton, Checkbox
  , ColorPicker, TextField, Button, Tooltip, Popover, Select, DataTable, Badge ,
  Spinner,
  SkeletonDisplayText,
  SkeletonBodyText
} from '@shopify/polaris'
import { useAuthenticatedFetch } from '../hooks';
import { LockIcon } from '@shopify/polaris-icons';
import { Modal, useToast } from '@shopify/app-bridge-react';
import { MyContext } from '../components/providers/PlanProvider';

export default function Settings() {

  const [starValue, setStarValue] = useState('themecolor');
  const [checked, setChecked] = useState(false);
  const [showReviewChecked, setShowReviewChecked] = useState(true);
  const [email, setEmail] = useState('')
  const [popoverActive, setPopoverActive] = useState(false);
  const [popoverActiveStar, setPopoverActiveStar] = useState(false);
  const [popoverActiveDivider, setPopoverActiveDivider] = useState(false);
  const [starRgb, setStarRgb] = useState('#D3D3D3');
  const [borderRgb, setBorderRgb] = useState('#D3D3D3');
  const [divierRgb, setDividerRgb] = useState('#D3D3D3');
  const [formData, setFormData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resetLoading , setResetLoading] = useState(true)
  const [saveLoading , setSaveLoading] = useState(true)
  const [isEmailValid , setEmailValid] = useState(true)
  const {activePlan , planExists} = useContext(MyContext).hasPlan;

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
    { autopublish: 'disabled' }); //for autopublish setting


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
    reviewLink: 'Write a Review Here',
    noReviewSummary: 'No reviews yet',
    reviewSummary: "Based on {{product.reviews_count}} {{ product.reviews_count | pluralize: 'review', 'reviews' }}",
    paginationNextLabel: 'Next &raquo;',
    paginationPrevLabel: '&laquo; Previous',
    reportAsinappropriate: 'Report as Inappropriate',
    reportAsinappropriateMessage: 'This review has been reported',
    authorInformation: "<p><i><b>${itm.userName} </b> on <b>${itm.datePosted}</b></i></p>"
  })

  const [reviewFormText, setReviewFormText] = useState({ // for review form text setting 
    authorEmail: 'Email',
    emailHelpMessage: 'xyz@example.com',
    emailType: 'required',
    authorName: 'Name',
    nameHelpMessage: 'Enter your name here',
    nameType: 'required',
    authorLocation: 'Location',
    locationHelpMessage: 'Enter your location here',
    locationType: 'hidden',
    reviewFormTitle: 'Write a Review',
    reviewRating: 'Rating',
    reviewTitle: 'Review Title',
    reviewTitleHelpMessage: 'Give your review a heading',
    reviewBody: 'Body of Review',
    reviewBodyHelpMessage: 'Write your description here',
    submitButtton: 'Submit Review',
    successMessage: 'Thank you for submitting a review!',
    errorMessage: 'Fields and rating can not be left empty.',
  })

  const [BadgeText, setBadgeText] = useState({ // for badge text setting 
    noReviewsBadge: 'No reviews',
    reviewsBadge: "${count} reviews"
  })


  //******** variables********



  const { show } = useToast();
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
    checkTableExists()
  }, [activePlan])

  useEffect(() => {
    setStarRgb(convertToHex(color))
    handleStarColorSetting('customColor', starRgb)

  }, [color])

  useEffect(() => {


    setBorderRgb(convertToHex(borderColor))
    handleReviewListing('bordercolor', borderRgb)


  }, [borderColor])

  useEffect(() => {

    setDividerRgb(convertToHex(dividerColor))
    handleReviewListing('dividercolor', divierRgb)
  }, [dividerColor])



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

  const saveSettings = async() => {
    setSaveLoading(true)
    const emailRegex = /^\S+@\S+\.\S+$/;
    if(checked===true){
      if ((email.match(emailRegex)) && (email != '')) {
        setEmailValid(true)
        await save()
      }
      else{
        setEmailValid(false)
        setSaveLoading(false)
        show('Invalid Email!.', { duration: 2000 })
      }
    }
    else{
      await save();
    }

    async function save(){

      fetch('/api/settings/saveSettings', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data }),
      })
        .then(res => res.json())
        .then(data => { show('Settings saved.', { duration: 2000 }) , setSaveLoading(false)})
        .catch(error => console.error(error));
    }

  }

  const checkTableExists = () => {

    fetch(`/api/table/checkTableExists`)
      .then(res => res.json())
      .then(tableExists => {
        if(tableExists===true){
          getSettings()
        }
        else{
          createAllTables()
        }
      })
      .catch(error => console.error(error));
  }


  const sendMail = () => {

    fetch(`/api/settings/sendMail`)
      .then(res => res.json())
      .then(data => {(data)})
      .catch(error => console.error(error));
  }
  const getSettings = () => {

    fetch(`/api/settings/getSettings`)
      .then(res => res.json())
      .then(data => {setFormData(data), setResetLoading(false) , setSaveLoading(false)})
      .catch(error => console.error(error));
  }

  async function createAllTables() {
    await fetch(`api/table/createReviewTable`)
     .then((res) => res.json())
     .then((data) => (data))
     .catch(error => console.error(error));

    await fetch(`api/table/createDetailTable`)
     .then((res) => res.json())
     .then((data) => (data))
     .catch(error => console.error(error));

    await fetch(`api/table/createDeletedReviewsTable`)
     .then((res) => res.json())
     .then((data) => { (data) })
     .catch(error => console.error(error));

    await fetch(`api/settings/addSettingsData`)
     .then((res) => res.json())
     .then((data) => { getSettings() })
     .catch(error => console.error(error));

 }


  const resetSettings = () => {

    fetch(`/api/settings/resetSettings`)
      .then(res => res.json())
      .then(data => { setFormData(data), show('Default settings successfully applied.', { duration: 2000 }) , setResetLoading(false)})
      .catch(error => console.error(error));
  }

  const test = () => {

    fetch(`/api/table/createSettingsTable`)
      .then(res => res.json())
      .then(data => (data))
      .catch(error => console.error(error));
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
      .then(data => ((data)))
      .catch(error => console.error(error));
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
    <>
      <InlineStack>
        <Button onClick={togglePopoverActive}  loading={saveLoading ? true : false}>
          Choose Color
        </Button>
        <Box style={{ backgroundColor: reviewListingLayout?.bordercolor, width: '30px', height: "30px", borderRadius: '5px', marginLeft: '10px' }}>
        </Box>
      </InlineStack>
    </>

  );

  const activatordivider = (
    <>
      <InlineStack>
        <Button onClick={togglePopoverActiveDivider} loading={saveLoading ? true : false}>
          Choose Color
        </Button>
        <Box style={{ backgroundColor: reviewListingLayout?.dividercolor, width: '30px', height: "30px", borderRadius: '5px', marginLeft: '10px' }}>
        </Box>
      </InlineStack>
    </>
  );

  const activatorStar = (
    <>
      <InlineStack >
        <Button onClick={togglePopoverActiveStar} loading={saveLoading ? true : false}  >
          Choose Color
        </Button>
        <Box style={{ backgroundColor: starIconColor.customColor, width: '30px', height: "30px", borderRadius: '5px', marginLeft: '10px' }} >
        </Box>
      </InlineStack>
    </>
  );

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
                    <Text variant='headingMd' as='h6'> Auto-Publish</Text>
                    <Text variant='bodyLg' as='p'>New reviews are automatically published without manual intervention.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                    {
                      activePlan === 'Pro Plan' ? '' :  <Box paddingBlockEnd={200}><Badge tone="attention" size="small" icon={LockIcon} >PRO</Badge></Box>
  
                    }
                  <BlockStack gap={300}>
                    {
                      saveLoading ? <SkeletonBodyText lines={2}  /> :
                    <RadioButton
                      label={<Text variant="headingSm" as="h6">Enable</Text>}
                      helpText="Reviews are checked for spam and then automatically published when enabled"
                      checked={AutopublishSetting.autopublish === 'enabled'}
                      id="enabled"
                      name="accounts"
                      disabled={activePlan === 'Pro Plan' ? false : true}
                      onChange={handleAutopublish}
                    />
                  
                  }
                    {
                      saveLoading ? <SkeletonBodyText lines={2}  /> :
                    <RadioButton
                      label={saveLoading ? <SkeletonBodyText lines={1} /> :<Text variant="headingSm" as="h6">Disable</Text>}
                      helpText="Reviews require manual approval before they can be published on your store."
                      id="disabled"
                      name="accounts"
                      checked={AutopublishSetting.autopublish === 'disabled'}
                      onChange={handleAutopublish}
                    />
                    }
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
                    <Text variant='headingMd' as='h6'>Email Notification</Text>
                    <Text variant='bodyLg' as='p'>Receive email notifications for each review.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={300}>
                    <Checkbox
                      label={<Text variant="headingSm" as="h6">"Send me an email when a review is submitted."</Text>}
                      checked={emailSetting.sendEmail}
                      onChange={handleCheck}
                    />
                    {
                      checked ?
                        <TextField
                          label="Email"
                          type="email"
                          placeholder='xyz@example.com'
                          value={emailSetting.email}
                          onChange={handeEmailtoSend}
                          autoComplete="off"
                          error={!isEmailValid ? 'enter valid email address' : ''}
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
                    <Text variant='headingMd' as='h6'>Star Icon Color</Text>
                    <Text variant='bodyLg' as='p'>Choose the color of your star icons.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={300}>
                    {/* <RadioButton
                      disabled
                      label="Theme Color"
                      helpText="Icons will reflect the color scheme of your theme."
                      checked={starIconColor.isThemeColor === 'themecolor'}
                      id="themecolor"
                      name="star"
                      onChange={handleStarSetting}
                    /> */}

                    <RadioButton

                      label={<Text variant="headingSm" as="h6">Custom Color</Text>}
                      helpText="Select a custom color for your icons."
                      id="customcolor"
                      name="star"
                      // checked={starIconColor.isThemeColor == 'customcolor'}
                      checked={'customcolor'}
                      onChange={handleStarSetting}
                    />

                    {
                      // starIconColor.isThemeColor == 'customcolor' ?
                      true ?
                        <Popover
                          active={popoverActiveStar}
                          activator={activatorStar}
                          autofocusTarget="first-node"
                          onClose={togglePopoverActiveStar}
                        >
                          <ColorPicker onChange={setStarColorfunction} color={color} />
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
                    <Text variant='headingMd' as='h6'>Review Listing Layout</Text>
                    <Text variant='bodyLg' as='p'> Tailor the appearance of your review listing for a personalized experience.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={300}>
                    <Checkbox
                      label={<Text variant="headingSm" as="h6">Show Reviews on Load</Text>}
                      checked={reviewListingLayout.reviewOnload}
                      onChange={showReviewCheck}
                    />
                    <Text as='p' tone='subdued'>Enable this option to make product reviews visible to all users upon page load.</Text>
                    <Divider />
                    <Text variant="headingSm" as="h6">Border Color</Text>
                    <Box>
                    <Popover
                      active={popoverActive}
                      activator={activator}
                      autofocusTarget="first-node"
                      onClose={togglePopoverActive}
                    >
                      <ColorPicker onChange={setBorderColorfunction} color={borderColor} />
                    </Popover>
                    <Text as='p' tone='subdued'>Choose the color of the border surrounding each review.</Text>
                    </Box>

                    <Text variant="headingSm" as="h6">Divider Color</Text>
                    <Box>
                    <Popover
                      active={popoverActiveDivider}
                      activator={activatordivider}
                      autofocusTarget="first-node"
                      onClose={togglePopoverActiveDivider}
                    >
                      <ColorPicker onChange={setDividerColorfunction} color={dividerColor} />
                    </Popover>
                    <Text as='p' tone='subdued'>Select the color for the divider line between individual reviews.</Text>
                    </Box>

                    <Box>
                      <TextField
                        label={<Text variant="headingSm" as="h6">Padding</Text>}
                        type="number"
                        value={reviewListingLayout.reviewListingPadding}
                        onChange={(value) =>{ value >=0 ? handleReviewListing('reviewListingPadding', value) :''}}
                        autoComplete="off"
                      />
                      <Text as='p' tone='subdued'>Adjust the padding around the review section for optimal spacing and layout.</Text>
                    </Box>

                    <Box>
                    <TextField
                      label={<Text variant="headingSm" as="h6">Reviews Per Page</Text>}
                      type="number"
                      value={reviewListingLayout.reviewPerpage}
                      onChange={(value) =>{ value >=2 && value<=100 ? handleReviewListing('reviewPerpage', value) :''}}
                      autoComplete="off"
                    />
                    <Text as='p' tone='subdued'>Specify the number of reviews to display per page, ranging from 2 to 100.</Text>
                    </Box>

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
                    <Text variant='headingMd' as='h6'>Review Listing Text</Text>
                    <Text variant='bodyLg' as='p'>Customize the text displayed in the area where reviews appear on your website.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={600}>
                    <Box>
                      <TextField
                        label={<Text variant="headingSm" as="h6">Review Headline</Text>}
                        type="text"
                        value={reviewListingText.reviewHeadline}
                        onChange={(value) => handlereviewListingText('reviewHeadline', value)}
                        autoComplete="off"
                      />
                      <Text as='p' tone="subdued">Set the headline for your customer reviews section.</Text>
                    </Box>

                    <Box>
                      <TextField
                        label={<Text variant="headingSm" as="h6">Review Link</Text>}
                        type="text"
                        value={reviewListingText.reviewLink}
                        onChange={(value) => handlereviewListingText('reviewLink', value)}
                        autoComplete="off"
                      />
                      <Text as='p' tone="subdued">Customize the text for the link that prompts users to write a review..</Text>
                    </Box>

                    <Box>
                    <TextField
                      label={<Text variant="headingSm" as="h6">Review Summary with No Reviews</Text>}
                      type="text"

                      value={reviewListingText.noReviewSummary}
                      onChange={(value) => handlereviewListingText('noReviewSummary', value)}
                      autoComplete="off"
                    />
                    <Text as='p' tone='subdued'>Specify the text to display when there are no reviews for a product.</Text>
                    </Box>

                    <Box>
                    <TextField
                      label={<Text variant="headingSm" as="h6">Review Summary with 1 or More Reviews</Text>}
                      type="text"

                      value={reviewListingText.reviewSummary}
                      onChange={(value) => handlereviewListingText('reviewSummary', value)}
                      autoComplete="off"
                    />
                    <Text as='p' tone='subdued'>Define the text format for summarizing reviews based on the total number.</Text>
                    </Box>

                    <Box>
                    <TextField
                      label={<Text variant="headingSm" as="h6">Pagination 'Next' Label </Text>}
                      type="text"

                      value={reviewListingText.paginationNextLabel}
                      onChange={(value) => handlereviewListingText('paginationNextLabel', value)}
                      autoComplete="off"
                    />
                    <Text as='p' tone='subdued'>Modify the text for the 'Next' button in pagination.</Text>
                    </Box>

                    <Box>
                    <TextField
                      label={<Text variant="headingSm" as="h6">Pagination 'Previous' Label </Text>}
                      type="text"

                      value={reviewListingText.paginationPrevLabel}
                      onChange={(value) => handlereviewListingText('paginationPrevLabel', value)}
                      autoComplete="off"
                    />
                    <Text>Modify the text for the 'Previous' button in pagination.</Text>
                    </Box>

                    <Box>
                    <TextField
                      label={<Text variant="headingSm" as="h6">Report as Inappropriate </Text>}
                      type="text"
                      value={reviewListingText.reportAsinappropriate}
                      onChange={(value) => handlereviewListingText('reportAsinappropriate', value)}
                      autoComplete="off"
                    />
                    <Text as='p' tone='subdued'>Set the text for reporting a review as inappropriate.</Text>
                    </Box>

                    <Box>
                    <TextField
                      label={<Text variant="headingSm" as="h6">"Reported as Inappropriate Message</Text>}
                      type="text"

                      value={reviewListingText.reportAsinappropriateMessage}
                      onChange={(value) => handlereviewListingText('reportAsinappropriateMessage', value)}
                      autoComplete="off"
                    />
                    <Text as='p' tone='subdued'>Define the message to display when a review has been reported.</Text>
                    </Box>

                    <Box>
                    <TextField
                      label={<Text variant="headingSm" as="h6">Author Information Template</Text>}
                      type="text"
                      multiline={4}
                      value={reviewListingText.authorInformation}
                      onChange={(value) => handlereviewListingText('authorInformation', value)}
                      autoComplete="off"
                    />
                    <Text as='p' tone='subdued'>Customize the template for displaying author information in reviews.</Text>
                    </Box>

                    <Text as='p' tone="subdued">
                      {'Note: This field supports basic JavaScript syntax. You can use variables like ${itm.userName} for the username and ${itm.datePosted} for the review date'}
                    </Text>

                  </BlockStack>
                </Box>
              </Grid.Cell>
            </Grid>
            <Divider borderColor="border" />
          </BlockStack>

          {/* 6 review form text  setting  */}
          <BlockStack gap={600}>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 4, xl: 4 }} >
                <Box padding={400} >
                  <BlockStack gap={400} align='center'>
                    <Text variant='headingMd' as='h6'>Review Form Text </Text>
                    <Text variant='bodyLg' as='p'>Customize the content and fields displayed in the new review form</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={400}>
                    <TextField
                      disabled={reviewFormText.emailType === 'hidden' ? true : false}
                      label={<Text variant="headingSm" as="h6">Author's Email Address</Text>}
                      type="text"
                      value={reviewFormText.authorEmail}
                      onChange={(value) => handlereviewFormText('authorEmail', value)}
                      autoComplete="off"
                    />
                    <TextField
                      disabled={reviewFormText.emailType === 'hidden' ? true : false}
                      label={<Text variant="headingSm" as="h6">Help Message</Text>}
                      type="text"
                      value={reviewFormText.emailHelpMessage}
                      onChange={(value) => handlereviewFormText('emailHelpMessage', value)}
                      autoComplete="off"
                    />

                    <Select
                      label={<Text variant="headingSm" as="h6">Type</Text>}
                      options={emailTypeoptions}
                      onChange={(value) => handlereviewFormText('emailType', value)}
                      value={reviewFormText.emailType}
                    />

                    <Divider />

                    <TextField
                      disabled={reviewFormText.nameType === 'hidden' ? true : false}
                      label={<Text variant="headingSm" as="h6">Author's Name</Text>}
                      type="text"
                      value={reviewFormText.authorName}
                      onChange={(value) => handlereviewFormText('authorName', value)}
                      autoComplete="off"
                    />
                    <TextField
                      disabled={reviewFormText.nameType === 'hidden' ? true : false}
                      label={<Text variant="headingSm" as="h6">Help Message</Text>}
                      type="text"
                      value={reviewFormText.nameHelpMessage}
                      onChange={(value) => handlereviewFormText('nameHelpMessage', value)}
                      autoComplete="off"
                    />

                    <Select
                      label={<Text variant="headingSm" as="h6">Type</Text>}
                      options={nameTypeoptions}
                      onChange={(value) => handlereviewFormText('nameType', value)}
                      value={reviewFormText.nameType}
                    />

                    <Divider />

                    <TextField
                      disabled={reviewFormText.locationType === 'hidden' ? true : false}
                      label={<Text variant="headingSm" as="h6">Author's Location</Text>}
                      type="text"
                      value={reviewFormText.authorLocation}
                      onChange={(value) => handlereviewFormText('authorLocation', value)}
                      autoComplete="off"
                    />

                    <TextField
                      disabled={reviewFormText.locationType === 'hidden' ? true : false}
                      label={<Text variant="headingSm" as="h6">Help Message</Text>}
                      type="text"
                      value={reviewFormText.locationHelpMessage}
                      onChange={(value) => handlereviewFormText('locationHelpMessage', value)}
                      autoComplete="off"
                    />

                    <Select
                      label={<Text variant="headingSm" as="h6">Type</Text>}
                      options={locationTypeoptions}
                      onChange={(value) => handlereviewFormText('locationType', value)}
                      value={reviewFormText.locationType}
                    />

                    <Divider />

                    <TextField
                      label={<Text variant="headingSm" as="h6">Review Form Title</Text>}
                      type="text"
                      value={reviewFormText.reviewFormTitle}
                      onChange={(value) => handlereviewFormText('reviewFormTitle', value)}
                      autoComplete="off"
                    />

                    <TextField
                      label={<Text variant="headingSm" as="h6">Rating Field</Text>}
                      type="text"
                      value={reviewFormText.reviewRating}
                      onChange={(value) => handlereviewFormText('reviewRating', value)}
                      autoComplete="off"
                    />

                    <Divider />

                    <TextField
                      label={<Text variant="headingSm" as="h6">Review Heading</Text>}
                      type="text"
                      value={reviewFormText.reviewTitle}
                      onChange={(value) => handlereviewFormText('reviewTitle', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label={<Text variant="headingSm" as="h6">Help Message</Text>}
                      type="text"
                      value={reviewFormText.reviewTitleHelpMessage}
                      onChange={(value) => handlereviewFormText('reviewTitleHelpMessage', value)}
                      autoComplete="off"
                    />

                    <Divider />

                    <TextField
                      label={<Text variant="headingSm" as="h6">Description of Review</Text>}
                      type="text"
                      value={reviewFormText.reviewBody}
                      onChange={(value) => handlereviewFormText('reviewBody', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label={<Text variant="headingSm" as="h6">Help Message</Text>}
                      type="text"
                      value={reviewFormText.reviewBodyHelpMessage}
                      onChange={(value) => handlereviewFormText('reviewBodyHelpMessage', value)}
                      autoComplete="off"
                    />

                    <Divider />

                    <TextField
                      label={<Text variant="headingSm" as="h6">Submit Button</Text>}
                      type="text"
                      value={reviewFormText.submitButtton}
                      onChange={(value) => handlereviewFormText('submitButtton', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label={<Text variant="headingSm" as="h6">Success Message</Text>}
                      type="text"
                      value={reviewFormText.successMessage}
                      onChange={(value) => handlereviewFormText('successMessage', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label={<Text variant="headingSm" as="h6">Error Message</Text>}
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
                    <Text variant='headingMd' as='h6'>Badge Text </Text>
                    <Text variant='bodyLg' as='p'>Personalize the text for star rating badges by adjusting the text fields.</Text>
                  </BlockStack>
                </Box>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 8, sm: 4, md: 4, lg: 8, xl: 8 }}>
                <Box background='bg-surface' padding={400}>
                  <BlockStack gap={300}>
                    <TextField
                      label={<Text variant="headingSm" as="h6">Badge with No Reviews</Text>}
                      type="text"
                      value={BadgeText.noReviewsBadge}
                      onChange={(value) => handleBadgeText('noReviewsBadge', value)}
                      autoComplete="off"
                    />
                    <TextField
                      label={<Text variant="headingSm" as="h6">Badge with 1 or More Reviews</Text>}
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
              title="Reset all settings to default?" message="Are you sure you want to reset all settings to their default values? This action cannot be undone."
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              size='Small'
              primaryAction={{
                content: 'Reset',
                onAction: () => { resetSettings(), setIsModalOpen(false) , setResetLoading(true) }
              }}
              secondaryActions={[
                {
                  content: 'cancel',
                  onAction: () => setIsModalOpen(false)
                }
              ]}
            />
            <Button size='large' onClick={() => setIsModalOpen(true)} tone='critical' variant='primary' loading={resetLoading}> Reset all settings to default</Button>
            <Button size='large' onClick={() =>{ saveSettings() }} tone='success' variant='primary' loading={saveLoading}> Save </Button>
          </InlineStack>
        </BlockStack>
      </Page>
    </>
  )
}

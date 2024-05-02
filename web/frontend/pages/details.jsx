import {
  Box, Page, Link, Grid, BlockStack, InlineStack, Text, Divider, Thumbnail,
  TextField, Button, SkeletonDisplayText, SkeletonBodyText, Badge, Spinner,
  SkeletonThumbnail, Image, Banner,
  Icon
} from "@shopify/polaris";
import { TitleBar, useToast } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks";
import { StarFilledIcon, StarIcon, CheckIcon } from '@shopify/polaris-icons';
import { useNavigate } from "react-router-dom";
import emptyStar from '../assets/star-regular.svg'
import HalfStar from '../assets/star-half.svg'
import solidStar from '../assets/star-solid.svg'

export default function Details() {

  const [review, setReview] = useState();
  const [textFieldValue, setTextFieldValue] = useState('');
  const [product, setProduct] = useState()
  const [status, setStatus] = useState();
  const [cardLoading, setCardLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  // const [metafields, setMetaFields] = useState();
  const [productDescription, setProductDescription] = useState()
  const [published, setPublish] = useState(0);
  const [unpublished, setUnpublished] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRating, setTotalRating] = useState(0);
  const [showWarning, setShowWarning] = useState(0);
  const [replyLoading ,setReplyLoading]=useState(false)
  const [statusBtnLoading , setStatusBtnLoading] = useState(false)


  //*******variables********
  const { show } = useToast();
  const fetch = useAuthenticatedFetch();
  const Navigate = useNavigate();
  const stars = [1, 2, 3, 4, 5];
  const star = 2;
  const Url = window.location.search;
  const params = new URLSearchParams(Url);
  const Id = params.get('id');

  //*******functions********

  function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  }


  const deleteReview = () => {
    fetch(`/api/review/deleteReview/${Id}`)
      .then(res => res.json())
      .then(data => { getReviewDetails(), show(' Review deleted ', { duration: 2000 }) , updateMetafield(data) , Navigate("/") })
      .catch(error => console.error(error));
  }

  const publishReview = () => {
    fetch(`/api/review/publishReview/${Id}`)
      .then(res => res.json())
      .then(data => getReviewDetails())
      .catch(error => console.error(error));
  }



  const handleTextFieldChange = useCallback(
    (value) => setTextFieldValue(value),
    [],
  );

  const getReviewDetails = () => {
    setCardLoading(true)
    fetch(`api/details/getAllDetails/${Id}`)
      .then(res => res.json())
      .then(data => checkForInappropriate(data))
      .catch(error => console.error(error));
  }

  function checkForInappropriate(data) {
    let isInappropriate = (data[0]?.isInappropriate)
    isInappropriate === 1 ?
      setShowWarning(1)
      :
      setShowWarning(0);

    setReview(data[0])
    setTextFieldValue(data[0]?.reply ? data[0].reply : '')
  }
const dissmissInappropriate=()=>{
  fetch(`api/details/dissmissInappropriate/${Id}`)
  .then(res => res.json())
  .then(data => {setShowWarning(0),show('Cleared Inappropriate review ', { duration: 2000 })})
  .catch(error => console.error(error));
}

  const changeStatus = () => {
    if (review?.reviewStatus =='Published'){
      unpublishReview()
    }
    else{
      publishReviews()
    }

  }
  const publishReviews = () => {
    fetch(`/api/review/publishReview/${Id}`)
      .then(res => res.json())
      .then(data => { getReviewDetails(),show('Review published  ', { duration: 2000 }), updateMetafield(data) , setStatusBtnLoading(()=>false) })
      .catch(error => console.error(error));
  }

  const unpublishReview = () => {
    fetch(`/api/review/unpublishReview/${Id}`)
      .then(res => res.json())
      .then(data => { getReviewDetails(), show('Review unpublished ', { duration: 2000 }), updateMetafield(data) , setStatusBtnLoading(()=>false) })
      .catch(error => console.error(error));
  }

  const postReply = () => {
    fetch('api/details/postReply', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ textFieldValue, Id }),
    })
      .then(res => res.json())
      .then(data => { getReviewDetails() ,  setTextFieldValue(review?.reply), show(' Reply posted. ', { duration: 2000 }) , setReplyLoading(false)})
      .catch(error => console.error(error));
  }

  const getProductDetails = () => {

    setProductLoading(true)
    fetch(`api/details/getProductDetails/${review?.productid}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(error => console.error(error));

  }

  const getProductReviewDetails = () => {
    fetch(`api/details/getProductReviewDetails/${review?.productid}`)
      .then(res => res.json())
      .then(data => setProductDescription(data))
      .catch(error => console.error(error));

  }

  
  const updateMetafield=(data)=>{

    const productHandle = data?.productHandle;
    const productid = data?.productid;
    fetch(`/api/table/updateMetafields/${Id}/${productid}/${productHandle}`)
      .then(res => res.json())
      .then(data => { (data) })
      .catch(error => console.error(error));
  }
  //*******useEffects********

  useEffect(()=>{
    if(!Id || Id===''){
      Navigate("/")
      show("To see the details, navigate to Reviews > Details.", { duration: 2000 })
    }
  },[])

  useEffect(() => {
    setStatusLoading(true)
    if(!Id || Id===''){}
    else{
    getReviewDetails();
    }
  }, [status])


  useEffect(() => {
    review ?
      <>
        {
          getProductDetails()}
        {
          getProductReviewDetails()
        }

      </>

      : ""
  }, [review])


  useEffect(() => {
    setStatusLoading(false);
    review ?
      setCardLoading(false)
      : ""
  }, [review])

  useEffect(() => {
    product ?
      setProductLoading(false)
      : ""
  }, [product])

  useEffect(() => {

    let sum = 0;

    productDescription?.forEach((itm) => {
      sum += Number(itm.starRating);
    });

    const avgRating = productDescription?.length > 0 ? sum / productDescription?.length : 0;
    const totalRating = productDescription?.length
    setPublish(totalRating)
    setAverageRating(avgRating);

  }, [productDescription])
  return (
    <Page
      title={review?.reviewTitle}
      titleMetadata={ formatDate(review?.datePosted)}
    >

      <BlockStack gap='300'>
        <Box maxWidth="100px">
        <Button variant="secondary" loading={statusBtnLoading} onClick={() => {changeStatus() , setStatusBtnLoading(true)}} textAlign="start" size="medium" fullWidth='false' >
          {
           
              review?.reviewStatus == 'Published' ?
                'Unpublish' :
                'Publish'
              
          }
        </Button>
        </Box>
        {
          showWarning?
        <Banner onDismiss={() => {dissmissInappropriate()}} tone="warning">
          <p>
            This review has been reported as inappropriate.
          </p>
        </Banner>
        :''
        }
        <Box>
          <Grid >
            <Grid.Cell columnSpan={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
              <Box background="bg-surface" borderColor="border" borderWidth="025" padding={600} minHeight="235px">
                {
                  cardLoading ?
                    <>
                      <BlockStack gap={400}>
                        <SkeletonDisplayText />
                        <Divider borderColor="transparent" />
                        <Divider borderColor="transparent" />
                        <SkeletonBodyText />
                      </BlockStack>
                    </>
                    :
                    <>
                      <BlockStack gap={400}>

                        <InlineStack >
                          {
                            statusLoading ?
                              <>
                                <Box minWidth="400px">

                                </Box>
                                <Spinner size="small" />
                              </>
                              :
                              <>
                                <InlineStack>
                                  {
                                    stars?.map((itm) =>
                                      review?.starRating >= itm ?
                                        <Image source={solidStar} key={itm} />
                                        :
                                        <Image source={emptyStar} key={itm} />


                                    )
                                    }
                                </InlineStack>
                                <Box minWidth="450px">

                                  <InlineStack align="end" gap={200}>

                                    <Text>{ review?.isSpam ? <Badge tone="critical">SPAM</Badge> : '' } </Text>
                                    <Text>{
                                      review?.reviewStatus == 'Published' ?
                                        <Badge tone="success" progress="complete">
                                          {review?.reviewStatus}
                                        </Badge> :
                                        review?.reviewStatus == 'Unpublished' ?
                                          <Badge tone='warning' progress="incomplete">
                                            {review?.reviewStatus}
                                          </Badge>
                                          : ''
                                    }
                                    </Text>
                                  </InlineStack>
                                </Box>

                              </>
                          }

                        </InlineStack>
                        <BlockStack gap={400}>
                          <Text variant="headingMd" as="h6" >{review?.reviewTitle}</Text>
                          <Text variant="bodyLg" as="p">{review?.reviewDescription}</Text>
                        </BlockStack>
                        <Divider />
                        <InlineStack>
                          <Text>{review?.userName}</Text>
                          {
                            (review?.location) ? <Text>,  from {review?.location} </Text> : ''
                          }

                          <><Text tone="magic-subdued">({review?.Email})</Text></>
                        </InlineStack>
                      </BlockStack>
                    </>
                }

              </Box>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }} >
              <Box background="bg-surface" borderColor="border" borderWidth="025" padding={600} minHeight="235px" onClick={() => Navigate(`/product/?id=${review.productid}&updateid=${Id}`)}>
                {
                  productLoading ? <>
                    <BlockStack gap={600}>
                      <SkeletonThumbnail size="medium" />
                      <Divider borderColor="transparent" />
                      <SkeletonBodyText />
                    </BlockStack>
                  </>
                    :
                    <>
                      <BlockStack gap={400} inlineAlign="start">
                        <Text variant="headingLg" as="h5" fontWeight='medium'>Product details</Text>
                        <Thumbnail source={product?.media?.edges[0].node.preview.image.originalSrc } alt="product img" />
                      </BlockStack>
                      <Box paddingBlock={300}>
                        <Divider />
                      </Box>
                      <Text variant="bodyLg" as="p">{product?.title}</Text>
                      <Box maxWidth="100px">
                        <InlineStack>
                          {
                            stars.map((itm) =>
                              averageRating >= itm ?
                                <Image source={solidStar} key={itm} />
                                :
                                averageRating + 0.5 === itm ?
                                  <Image source={HalfStar} key={itm} />
                                  :
                                  <Image source={emptyStar} key={itm} />
                            )
                          }
                        </InlineStack>
                      </Box>
                      {/* <Text variant="bodyLg" as="p">{metafields ? `${metafields[2].node.value} (reviews)` : ""}</Text> */}
                      <Text variant="bodyLg" as="p">{productDescription ? `${published} reviews` : ""}</Text>

                    </>
                }
              </Box>
            </Grid.Cell>
          </Grid>
        </Box>
        <Box >
          <Grid >
            <Grid.Cell columnSpan={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
              <Box background="bg-surface" borderColor="border" borderWidth="025" paddingInline={600} >
                {
                  cardLoading ?
                    <>
                      <BlockStack gap={400}>
                        <Divider borderColor="transparent" />
                        <SkeletonDisplayText />
                        <Divider borderColor="transparent" />
                        <SkeletonBodyText lines={2} />
                        <Divider borderColor="transparent" />
                      </BlockStack>
                    </>
                    :
                    <>
                      <Box paddingBlockStart={500} >
                        <Text variant="headingLg" as="h5" fontWeight='medium'>Reply to Review</Text>
                        <Box paddingBlock={400}>
                          <TextField
                            monospaced
                            value={ textFieldValue}
                            onChange={handleTextFieldChange}
                            multiline={4}
                            placeholder="Add a reply to this review..."
                            autoComplete="off"
                          />
                        </Box>
                        <Box paddingBlock={200}>
                          <Divider />
                        </Box>
                        <Box paddingBlock={200}>
                          <InlineStack align="end" >
                            <Button size="large" onClick={() => {postReply(), setReplyLoading(true)}}loading={replyLoading} variant="primary" tone="success">Post reply</Button>
                          </InlineStack>
                        </Box>
                      </Box>
                    </>

                }
              </Box>
            </Grid.Cell>
          </Grid>
        </Box>
      </BlockStack>
      <Box paddingBlock={500}>

        <Divider borderColor="border" />
      </Box>
      <Box>
      <Button size="large" onClick={() => deleteReview()} variant="primary" tone="critical" >Delete Review</Button>
      </Box>
    </Page>
  );
}

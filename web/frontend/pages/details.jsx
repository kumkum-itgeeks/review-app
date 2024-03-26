import {
  Box, Page, Link, Grid, BlockStack, InlineStack, Text, Divider, Thumbnail,
  TextField, Button, SkeletonDisplayText, SkeletonBodyText, Badge, Spinner,
  SkeletonThumbnail,Image,
  Icon
} from "@shopify/polaris";
import { TitleBar , useToast} from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks";
import { StarFilledIcon, StarIcon, CheckIcon } from '@shopify/polaris-icons';
import { useNavigate } from "react-router-dom";
import emptyStar from '../assets/star-regular.svg'
import HalfStar from '../assets/star-half.svg'
import solidStar from '../assets/star-solid.svg'

export default function Details() {

  const [textFieldValue, setTextFieldValue] = useState('');
  const [review, setReview] = useState();
  const [product, setProduct] = useState()
  const [status, setStatus] = useState();
  const [cardLoading, setCardLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [metafields, setMetaFields] = useState();
  const [productDescription,setProductDescription]=useState()
  const [published, setPublish] = useState(0);
  const [unpublished, setUnpublished] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRating, setTotalRating] = useState(0);


  //*******variables********
  const {show}=useToast();
  const fetch = useAuthenticatedFetch();
  const Navigate = useNavigate();
  const stars = [1, 2, 3, 4, 5];
  const star = 2;
  const Url = window.location.search;
  const params = new URLSearchParams(Url);
  const Id = params.get('id');

  //*******functions********

  const test = () => {
    console.log('id', review.productid)
  }

  const deleteReview = () => {
    fetch(`/api/review/deleteReview/${Id}`)
      .then(res => res.json())
      .then(data => {getReviewDetails(),show(' review deleted ', {duration: 2000})});
  }

  const publishReview = () => {
    fetch(`/api/review/publishReview/${Id}`)
      .then(res => res.json())
      .then(data => getReviewDetails());
  }
  const getMetafields = () => {
    fetch('/api/table/getMetafields')
      .then(res => res.json())
      .then(data => setMetaFields(data));
  }

  const handleTextFieldChange = useCallback(
    (value) => setTextFieldValue(value),
    [],
  );

  const getReviewDetails = () => {
    setCardLoading(true)
    fetch(`api/details/getAllDetails/${Id}`)
      .then(res => res.json())
      .then(data => setReview(data[0]))
  }

  const changeStatus = () => {
    fetch(`api/details/changeStatus/${Id}/${review.reviewStatus}`)
      .then(res => res.json())
  .then(data => {setStatus(data),show(` review ${review.reviewStatus=='Published'? 'unpublished' : 'published'} `, {duration: 2000}), console.log(status)})

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
      .then(data => {setTextFieldValue(''),show(' reply posted ', {duration: 2000})});
  }

  const getProductDetails = () => {

    setProductLoading(true)
    fetch(`api/details/getProductDetails/${review.productid}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      
    }
    
    const getProductReviewDetails=()=>{
      fetch(`api/details/getProductReviewDetails/${review.productid}`)
        .then(res => res.json())
        .then(data => setProductDescription(data))
      
  }
  //*******useEffects********


  useEffect(() => {
    setStatusLoading(true)
    getReviewDetails();
  }, [status])


  useEffect(() => {
    review ?
      <>
        {
          getProductDetails()}
        {
          getMetafields()
        }
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

  useEffect(()=>{

  let sum = 0;

  productDescription?.forEach((itm) => {
    sum += Number(itm.starRating);
  });
  
  const avgRating = productDescription?.length > 0 ? sum / productDescription?.length : 0;
  const totalRating=productDescription?.length
  setPublish(totalRating)
  setAverageRating(avgRating);

  },[productDescription])
  return (
    <Page
      title={review ? `${review.reviewTitle}` : ''}
      titleMetadata={review ? `${review.datePosted}` : ''}
    >
      {/* <TitleBar
        title={review ? `${review.reviewTitle}` : ''}
        secondaryActions={[
          {
            content: ("Delete"),
            onAction: () => deleteReview(),
          },
          {
            content: ("Publish"),
            onAction: () => publishReview(),
          }
        ]}
      /> */}
      <BlockStack gap='300'>
        <Button variant="plain" onClick={() => changeStatus()} textAlign="start" size="large" >
          {
            review ?
              review.reviewStatus == 'Published' ?
                'X Unpublish' :
                <> &#x2713; {'Publish'}</>
              : ""
          }
        </Button>
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
                                  {review ?
                                    stars.map((itm) =>
                                      review.starRating >= itm ?
                                      <Image source={solidStar} key={itm}/>
                                        :
                                        <Image source={emptyStar} key={itm}/>


                                    )
                                    : ''}
                                </InlineStack>
                                <Box minWidth="450px">

                                  <InlineStack align="end" gap={200}>

                                    <Text>{review ? review.isSpam ? <Badge tone="critical">SPAM</Badge> : '' : ""} </Text>
                                    <Text>{review ?
                                      review.reviewStatus == 'Published' ?
                                        <Badge tone="success" progress="complete">
                                          {review.reviewStatus}
                                        </Badge> :
                                        review.reviewStatus == 'Unpublished' ?
                                          <Badge tone='warning' progress="incomplete">
                                            {review.reviewStatus}
                                          </Badge>
                                          : ''
                                      : ''
                                    }
                                    </Text>
                                  </InlineStack>
                                </Box>

                              </>
                          }

                        </InlineStack>
                        <BlockStack gap={400}>
                          <Text variant="headingMd" as="h6" >{review ? `${review.reviewTitle}` : ''}</Text>
                          <Text variant="bodyLg" as="p">{review ? `${review.reviewDescription}` : ''}</Text>
                        </BlockStack>
                        <Divider />
                        <InlineStack>
                          <Text>{review ? `${review.userName}` : ''}</Text>
                          <Text><Link removeUnderline>{review ? `( ${review.userHandle} )` : ''}</Link></Text>
                        </InlineStack>
                      </BlockStack>
                    </>
                }

              </Box>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }} >
              <Box background="bg-surface" borderColor="border" borderWidth="025" padding={600} minHeight="235px" onClick={() => Navigate(`/product/?id=${review.productid}`)}>
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
                        <Thumbnail source={product ? `${product.media.edges[0].node.preview.image.originalSrc}` : ''} alt="product img" />
                      </BlockStack>
                      <Box paddingBlock={300}>
                        <Divider />
                      </Box>
                      <Text variant="bodyLg" as="p">{product ? `${product.title}` : ''}</Text>
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
                      <Text variant="bodyLg" as="p">{productDescription? `${published} (reviews)` : ""}</Text>

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
                            value={textFieldValue}
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
                            <Button size="large" onClick={() => postReply()}>Post reply</Button>
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
      <Button size="large" onClick={() => deleteReview()}>Delete</Button>
    </Page>
  );
}

import React from 'react'
import {
  Text, Page, Button, TextField, IndexTable, IndexFilters, useSetIndexFiltersMode,
  useIndexResourceState, ChoiceList, RangeSlider, Badge, useBreakpoints,
  Divider, Box, Link, Icon, InlineStack, Grid, BlockStack, Thumbnail, Image,
  SkeletonThumbnail , Pagination
} from "@shopify/polaris";
import { useTranslation, Trans } from "react-i18next";
import { TitleBar } from "@shopify/app-bridge-react";
import { useAuthenticatedFetch } from "../hooks";
import { MyContext } from '../components/providers/PlanProvider';
import { useState, useCallback, useEffect , useContext} from 'react';
import { useNavigate , useToast} from "@shopify/app-bridge-react";
import {  LockIcon } from '@shopify/polaris-icons';
import '../css/index.css'
import emptyStar from '../assets/star-regular.svg'
import HalfStar from '../assets/star-half.svg'
import solidStar from '../assets/star-solid.svg'


export default function Product() {
  const [Loading, setLoading] = useState(true);
  const [runOnce,setRunOnce]=useState(0);
  const [isLastPage , setIsLastPage]=useState(0)
  const [published, setPublish] = useState(0);
  const [unpublished, setUnpublished] = useState(0);
  const [product, setProduct] = useState();
  const [averageRating, setAverageRating] = useState(0);
  const [totalRating, setTotalRating] = useState(0);
  const [nextPage, setNextPage] = useState(true);
  const [prevPage, setPrevPage] = useState(true);
  const [selected, setSelected] = useState(0);
  const [totalRows, setTotalRows] = useState('');
  const [tableData, setTableData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [queryValue, setQueryValue] = useState('');
  const [taggedWith, setTaggedWith] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(3);
  const [moneySpent, setMoneySpent] = useState(undefined,);
  const [accountStatus, setAccountStatus] = useState(undefined,);
  const [reviewStatus, setReviewStatus] = useState('All Reviews');
  const [disableBulkActions  , setDisableBulkActions]=useState(false);
  const { activePlan, planExists } = useContext(MyContext).hasPlan;
  const [sortSelected, setSortSelected] = useState(['starRating desc']);
  const [itemStrings, setItemStrings] = useState([
    'All Reviews',
    'Published',
    'Unpublished',
    'Spam',
  ]);


  //********useEffects********

  
  const { selectedResources, allResourcesSelected, handleSelectionChange , clearSelection } =
    useIndexResourceState(tableData);

  useEffect(()=>{
    handleBulkActions()
  },[selectedResources])

  useEffect(() => {
    if(!Id || Id===''){
      Navigate("/")
      show("To access the Product section, navigate to Reviews > Details > Products.", { duration: 2000 })
    }
    else{
      getProduct();
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    if(!Id || Id===''){}
    else{
      getAllReviews();
    }

  }, [queryValue, pageNumber, sortSelected, reviewStatus])

  useEffect(() => {
    // setPageNumber(1);
  }, [queryValue, sortSelected, reviewStatus])

  useEffect(() => {
    setLoading(false)
  }, [tableData])


  useEffect(() => {

    if(pageNumber===1 && !isLastPage){
      setPrevPage(false)
      setNextPage(true)
    }
    else if(pageNumber===1 && isLastPage){
      setPrevPage(false)
      setNextPage(false)
    }
    else if(pageNumber!=1 && !isLastPage){
      setPrevPage(true)
      setNextPage(true)
    }
    else if(isLastPage && pageNumber!=1){
      setPrevPage(true)
      setNextPage(false)
    }
  }, [pageNumber, queryValue, sortSelected, reviewStatus])

  //********variables********

  const { show } = useToast();
  const { t } = useTranslation();
  const Url = window.location.search;
  const params = new URLSearchParams(Url);
  const Id = params.get('id');
  const updateid = params.get('updateid');
  const stars = [1, 2, 3, 4, 5];
  const star = 3;
  const fetch = useAuthenticatedFetch();
  const { mode, setMode } = useSetIndexFiltersMode();
  const resourceName = {
    singular: 'reveiw', plural: 'review',
  };
  const appliedFilters = [];
  const Navigate = useNavigate();
  const totalData = tableData.length;
  const totalPages = totalRows / recordsPerPage;

  //*******functions**********

    const handleBulkActions=()=>{
    let selected = selectedResources.length
    if(selected >1){
      setDisableBulkActions(true)
    }
    else{
      setDisableBulkActions(false)
    }
  }

  const showToast = (message) => {
    show(message, { duration: 2000 })
  }

  const setUpdateCount = (count, updateMessage, noUpdateMessage) => {
    if (count === 0) {
      showToast(`${noUpdateMessage}`)
    }
    else {
      showToast(`${count} ${updateMessage}`)
    }
  }
  function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  }

  const getProduct = () => {
    fetch(`/api/details/getProductDetails/${Id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(error => console.error(error));
  }

  const createMetafield = () => {
    fetch('/api/table/getMetafields')
      .then(res => res.json())
      .then(data => (data))
      .catch(error => console.error(error));
  }

    const updateMetafield=(data)=>{
      const productHandle = data?.productHandle;
    const productid = data?.productid;
    fetch(`/api/table/updateMetafields/${selectedResources}/${productid}/${productHandle}`)
      .then(res => res.json())
      .then(data => { (data) })
      .catch(error => console.error(error));
  }
  const deleteReview = () => {

    fetch(`/api/review/deleteReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => {getAllReviews() ,
         showToast(selectedResources?.length > 1 ? ` ${selectedResources?.length} Reviews deleted.` : ` ${selectedResources?.length} Review deleted.`),
       updateMetafield(data),
      clearSelection() })
      .catch(error => console.error(error));
  }


  const unSpamReview = () => {
    fetch(`/api/review/unSpam/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(), 
        setUpdateCount(Number(data.count), Number(data.count) > 1 ? 'Reviews unspammed.' : 'Review unspammed.', 'Reviews already unspammed.'), 
      clearSelection() })
      .catch(error => console.error(error));
  }

  const publishReview = () => {
    fetch(`/api/review/publishReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(),
         setUpdateCount(Number(data.count), Number(data.count) > 1 ? 'Reviews published.' : 'Review published.', 'Reviews already published.'),
          updateMetafield(data), 
          clearSelection() })
          .catch(error => console.error(error));
  }

  const unpublishReview = () => {
    fetch(`/api/review/unpublishReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(), 
        setUpdateCount(Number(data.count), Number(data.count) > 1 ? 'Reviews unpublished.' : 'Review unpublished.', 'Reviews already unpublished.'),
         updateMetafield(data), 
         clearSelection() })
         .catch(error => console.error(error));
  }

  const createTable = () => {
    fetch('/api/table/createDetailTable')
      .then(res => res.json())
      .then(data => (data))
      .catch(error => console.error(error));
  }

  const getAllReviews = () => {
    setLoading(true);
    fetch('/api/review/getProductReviews/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ queryValue, pageNumber, reviewStatus, sortSelected, Id }),
    })
      .then(res => res.json())
      .then(data => setAlldata(data))
      .catch(error => console.error(error));


  };

  function setAlldata(data){
    setTableData(data.reviews)
    setPublish(data.publishedReviews)
    setUnpublished(data.unpublishedReviews)
    setAverageRating(data.averageRating)
    setIsLastPage(data.isLastPage)
  }



  const onCreateNewView = async (value) => {
    await sleep(500);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    return true;
  };

  function disambiguateLabel(key, value) {
    switch (key) {
      case 'moneySpent':
        return `Money spent is between $${value[0]} and $${value[1]}`;
      case 'taggedWith':
        return `Tagged with ${value}`;
      case 'accountStatus':
        return (value).map((val) => `Customer ${val}`).join(', ');
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === '' || value == null;
    }
  }

  const onHandleCancel = () => { };

  const onHandleSave = async () => {
    await sleep(1);
    return true;
  };

  const handleAccountStatusChange = useCallback(
    (value) => setAccountStatus(value),
    [],
  );
  const handleMoneySpentChange = useCallback(
    (value) => setMoneySpent(value),
    [],
  );
  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    [],
  );
  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value),
    [],
  );
  const handleAccountStatusRemove = useCallback(
    () => setAccountStatus(undefined),
    [],
  );
  const handleMoneySpentRemove = useCallback(
    () => setMoneySpent(undefined),
    [],
  );

  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleTaggedWithRemove = useCallback(() => setTaggedWith(''), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
  const handleFiltersClearAll = useCallback(() => {
    handleAccountStatusRemove();
    handleMoneySpentRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleAccountStatusRemove,
    handleMoneySpentRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);

    


  //********data variables**********

  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => { setReviewStatus(item) },
    id: `${item}-${index}`,
    isLocked: index === 0,

  }));

  const sortOptions = [
    { label: 'Rating', value: 'starRating asc', directionLabel: 'Low - High' },
    { label: 'Rating', value: 'starRating desc', directionLabel: 'High - Low' },
    { label: 'Date', value: 'datePosted asc', directionLabel: 'Oldest - Newest' },
    { label: 'Date', value: 'datePosted desc', directionLabel: 'Newest - Oldest' },
    { label: 'Status', value: 'reviewStatus asc', directionLabel: 'A-Z' },
    { label: 'Status', value: 'reviewStatus desc', directionLabel: 'Z-A' },
  ];

  const filters = [
    {
      key: 'accountStatus',
      label: 'Account status',
      filter: (
        <ChoiceList
          title="Account status"
          titleHidden
          choices={[
            { label: 'Enabled', value: 'enabled' },
            { label: 'Not invited', value: 'not invited' },
            { label: 'Invited', value: 'invited' },
            { label: 'Declined', value: 'declined' },
          ]}
          selected={accountStatus || []}
          onChange={handleAccountStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'taggedWith',
      label: 'Tagged with',
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: 'moneySpent',
      label: 'Money spent',
      filter: (
        <RangeSlider
          label="Money spent is between"
          labelHidden
          value={moneySpent || [0, 500]}
          prefix="$"
          output
          min={0}
          max={2000}
          step={1}
          onChange={handleMoneySpentChange}
        />
      ),
    },
  ];



  const rowMarkup = tableData.map(
    (
      { id, starRating, reviewTitle, reviewDescription, datePosted, reviewStatus, userName, productHandle, isSpam },
      index,
    ) => (
      <IndexTable.Row
      
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>

          <Box maxWidth="100px">
            <InlineStack>
              {
                stars.map((itm) =>
                  starRating >= itm ?
                    <Image source={solidStar} key={itm} />
                    :

                    <Image source={emptyStar} key={itm} />

                )
              }
            </InlineStack>
          </Box>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as='span'>
            <Text tone="magic-subdued" >
              {reviewTitle}
            </Text>
          </Text>
          <Box maxWidth="200px">
            <Text truncate>
              {reviewDescription}
            </Text>
          </Box>
          <Text as='span'>
            -{userName} on <Text tone="magic-subdued">{productHandle}</Text>
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{formatDate(datePosted)}</IndexTable.Cell>
        <IndexTable.Cell id="tab">{
          reviewStatus == 'Published' && isSpam == false ?
            <Badge tone="success" progress="complete">
              {reviewStatus}
            </Badge> :
            reviewStatus == 'Unpublished' && isSpam == false ?
              <Badge tone='warning' progress="incomplete">
                {reviewStatus}
              </Badge> :
              isSpam ?
                <>
                  <InlineStack gap={200}>
                    {reviewStatus == 'Unpublished' ?
                      <Badge tone='warning' progress="incomplete">
                        {reviewStatus}
                      </Badge>
                      :
                      <Badge tone='success' progress="complete">
                        {reviewStatus}
                      </Badge>
                    }
                    <Badge tone='critical' >
                      SPAM
                    </Badge>
                  </InlineStack>
                </>
                :
                ''
        }
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Button onClick={(event) => {
            event.stopPropagation();
            Navigate(`/details/?id=${id}`);
          }}>
            Details
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );


  //conditional statements

  const promotedBulkActions =   activePlan === 'Basic Plan' && disableBulkActions ? [
    {
      content: 'Unspam selected reviews',
      onAction: () => { unSpamReview() },
      disabled: activePlan === 'Pro Plan' ? false : disableBulkActions
    },
    {
      content: 'Publish selected reviews',
      onAction: () => publishReview(),
      disabled: activePlan === 'Pro Plan' ? false : disableBulkActions
    },
    {
      content: 'Unpublish selected reviews',
      onAction: () => unpublishReview(),
      disabled: activePlan === 'Pro Plan' ? false : disableBulkActions
    },
    {
      content: 'Delete selected reviews',
      onAction: () => deleteReview(),
      disabled: activePlan === 'Pro Plan' ? false : disableBulkActions
    },
    {
      content: <Badge tone="attention" size="small" icon={LockIcon} >PRO</Badge>,
    }
  ]
  :
  [
    {
      content: 'Unspam selected reviews',
      onAction: () => { unSpamReview() },
      disabled: activePlan === 'Pro Plan' ? false : disableBulkActions
    },
    {
      content: 'Publish selected reviews',
      onAction: () => publishReview(),
      disabled: activePlan === 'Pro Plan' ? false : disableBulkActions
    },
    {
      content: 'Unpublish selected reviews',
      onAction: () => unpublishReview(),
      disabled: activePlan === 'Pro Plan' ? false : disableBulkActions
    },
    {
      content: 'Delete selected reviews',
      onAction: () => deleteReview(),
      disabled: activePlan === 'Pro Plan' ? false : disableBulkActions
    }
  ]

  if (accountStatus && !isEmpty(accountStatus)) {
    const key = 'accountStatus';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, accountStatus),
      onRemove: handleAccountStatusRemove,
    });
  }
  if (moneySpent) {
    const key = 'moneySpent';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, moneySpent),
      onRemove: handleMoneySpentRemove,
    });
  }
  if (!isEmpty(taggedWith)) {
    const key = 'taggedWith';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, taggedWith),
      onRemove: handleTaggedWithRemove,
    });
  }

  return (
    <>
      <Page
        title="Reviews"
      >

        <BlockStack gap={600}>
          <Box background="bg-surface" borderColor="border" borderWidth="025" paddingBlock="600"  >
            <Grid>
              <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                <BlockStack inlineAlign='center'>
                  {
                    product ?
                      <Thumbnail source={product.media.edges[0].node.preview.image.originalSrc} alt="product img" transparent />
                      :
                      <SkeletonThumbnail />
                  }
                </BlockStack>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                <BlockStack gap={600} inlineAlign='center' >
                  <Box maxWidth='100px'>

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
                  <Text fontWeight="medium" alignment='center' variant="bodyLg" as="p" tone="subdued">
                    Average Rating
                  </Text>
                </BlockStack>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                <BlockStack gap={300}>
                  <Text fontWeight="medium" alignment='center' variant="headingXl" as="h4">
                    {published}
                  </Text>
                  <Text fontWeight="medium" alignment='center' variant="bodyLg" as="p" tone="subdued">
                    published
                  </Text>
                </BlockStack>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                <BlockStack gap={300}>
                  <Text fontWeight="medium" alignment='center' variant="headingXl" as="h4">
                    {unpublished}
                  </Text>
                  <Text fontWeight="medium" alignment='center' variant="bodyLg" as="p" tone="subdued">
                    Unpublished
                  </Text>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Box>

          <Box borderColor="border" borderWidth="025" >

            <IndexFilters
              sortOptions={sortOptions}
              sortSelected={sortSelected}
              queryValue={queryValue}
              queryPlaceholder="Start typing to search for reviews..."
              onQueryChange={handleFiltersQueryChange}
              onQueryClear={() => setQueryValue('')}
              onSort={setSortSelected}
              cancelAction={{
                onAction: onHandleCancel,
                disabled: false,
                loading: false,
              }}
              tabs={tabs}
              selected={selected}
              onSelect={setSelected}
              canCreateNewView
              onCreateNewView={onCreateNewView}
              filters={[]}
              appliedFilters={appliedFilters}
              onClearAll={handleFiltersClearAll}
              mode={mode}
              setMode={setMode}
              loading={Loading}
              filteringAccessibilityTooltip='Search'
              hideFilters

            />
            <IndexTable
              condensed={useBreakpoints().smDown}
              resourceName={resourceName}
              itemCount={tableData.length}
              promotedBulkActions={promotedBulkActions}
              selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: 'Rating' },
                { title: 'Review' },
                { title: 'Date' },
                { title: 'Status' },
                { title: '' },
              ]}
            >
              {rowMarkup}
            </IndexTable>
            
            <Divider />
          </Box>
            <InlineStack align="center">
            <Pagination
              hasPrevious={prevPage}
              onPrevious={() => {
                pageNumber != 1 ? (setPageNumber(pageNumber - 1)) : '';
              }}
              hasNext={nextPage}
              onNext={() => {
                !isLastPage ? (setPageNumber(pageNumber + 1)) : '';
              }}
            />
          </InlineStack>
        </BlockStack>
      </Page>
    </>
  );

}

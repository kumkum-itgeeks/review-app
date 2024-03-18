import React, { useEffect } from 'react';
import {
  Box, InlineStack, Page, Grid, Text, SkeletonThumbnail,
  TextField, IndexTable, IndexFilters, useSetIndexFiltersMode,
  useIndexResourceState, ChoiceList, RangeSlider, Badge, useBreakpoints,
  Divider, BlockStack, Button, Icon, Link, Thumbnail
} from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { TitleBar } from '@shopify/app-bridge-react';
import { useAuthenticatedFetch } from '../hooks';
import { StarFilledIcon, StarIcon } from '@shopify/polaris-icons';


export default function Product() {
  const [reviews, setReviews] = useState([]);
  const [published, setPublish] = useState(0);
  const [unpublished, setUnpublished] = useState(0);
  const [product, setProduct] = useState();
  const [averageRating, setAverageRating] = useState(0);
  const [totalRating, setTotalRating] = useState(0);
  // const [sortSelected, setSortSelected] = useState(['order asc']);

  // const [selected, setSelected] = useState(0);
  // const [accountStatus, setAccountStatus] = useState(
  //   undefined,
  // );
  // const [moneySpent, setMoneySpent] = useState(
  //   undefined,
  // );
  // const [taggedWith, setTaggedWith] = useState('');
  const [queryValue, setQueryValue] = useState('');
  // const [itemStrings, setItemStrings] = useState([
  //   'All',
  //   'Unpaid',
  //   'Open',
  //   'Closed',
  //   'Local delivery',
  //   'Local pickup',
  // ]);
  //*********useEffects************

  useEffect(() => {
    getReviews();
    getProduct();
  }, [])


  useEffect(() => {
    reviews?.map((itm) => {
      itm.reviewStatus == 'Published' ?
        setPublish((prevValue) => prevValue + 1)
        :
        setUnpublished((prevValue) => prevValue + 1)
    })

    let sum = 0; 

    reviews?.forEach((itm) => {
      sum += Number(itm.starRating); 
    });

    const avgRating = reviews?.length > 0 ? sum / reviews.length : 0;

    setTotalRating(sum); 
    setAverageRating(avgRating); 

    console.log('averageRating', averageRating)
  }, [reviews])

  //*********variables*************

  const fetch = useAuthenticatedFetch();
  const stars = [1, 2, 3, 4, 5]
  const Url = window.location.search;
  const params = new URLSearchParams(Url);
  const Id = params.get('id');
  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  //*********functions*************

  const getReviews = () => {
    fetch(`/api/review/productReviews/${Id}`)
      .then(res => res.json())
      .then(data => setReviews(data))

  }

  const getProduct = () => {
    fetch(`/api/details/getProductDetails/${Id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
  }
  
  const publishReview=()=>{
    fetch(`/api/review/publishReview/${selectedResources}`)
    .then(res => res.json())
    .then(data => getReviews());
  }

  const unpublishReview=()=>{
    fetch(`/api/review/unpublishReview/${selectedResources}`)
    .then(res => res.json())
    .then(data => getReviews());
  }

  const deleteReview=()=>{
    fetch(`/api/review/deleteReview/${selectedResources}`)
    .then(res => res.json())
    .then(data => getReviews());
  }
  // const deleteView = (index) => {
  //   const newItemStrings = [...itemStrings];
  //   newItemStrings.splice(index, 1);
  //   setItemStrings(newItemStrings);
  //   setSelected(0);
  // };

  // const duplicateView = async (name) => {
  //   setItemStrings([...itemStrings, name]);
  //   setSelected(itemStrings.length);
  //   await sleep(1);
  //   return true;
  // };

  // const onCreateNewView = async (value) => {
  //   await sleep(500);
  //   setItemStrings([...itemStrings, value]);
  //   setSelected(itemStrings.length);
  //   return true;
  // };

  // const onHandleSave = async () => {
  //   await sleep(1);
  //   return true;
  // };

  // const handleAccountStatusChange = useCallback(
  //   (value) => setAccountStatus(value),
  //   [],
  // );
  // const handleMoneySpentChange = useCallback(
  //   (value) => setMoneySpent(value),
  //   [],
  // );
  // const handleTaggedWithChange = useCallback(
  //   (value) => setTaggedWith(value),
  //   [],
  // );
  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value),
    [],
  );
  // const handleAccountStatusRemove = useCallback(
  //   () => setAccountStatus(undefined),
  //   [],
  // );
  // const handleMoneySpentRemove = useCallback(
  //   () => setMoneySpent(undefined),
  //   [],
  // );
  // const handleTaggedWithRemove = useCallback(() => setTaggedWith(''), []);
  // const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
  // const handleFiltersClearAll = useCallback(() => {
  //   handleAccountStatusRemove();
  //   handleMoneySpentRemove();
  //   handleTaggedWithRemove();
  //   handleQueryValueRemove();
  // }, [
  //   handleAccountStatusRemove,
  //   handleMoneySpentRemove,
  //   handleQueryValueRemove,
  //   handleTaggedWithRemove,
  // ]);

  // function disambiguateLabel(key, value) {
  //   switch (key) {
  //     case 'moneySpent':
  //       return `Money spent is between $${value[0]} and $${value[1]}`;
  //     case 'taggedWith':
  //       return `Tagged with ${value}`;
  //     case 'accountStatus':
  //       return (value).map((val) => `Customer ${val}`).join(', ');
  //     default:
  //       return value;
  //   }
  // }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === '' || value == null;
    }
  }


  //************data variables***************

  // const tabs = itemStrings.map((item, index) => ({
  //   content: item,
  //   index,
  //   onAction: () => { },
  //   id: `${item}-${index}`,
  //   isLocked: index === 0,
  //   actions:
  //     index === 0
  //       ? []
  //       : [
  //         {
  //           type: 'rename',
  //           onAction: () => { },
  //           onPrimaryAction: async (value) => {
  //             const newItemsStrings = tabs.map((item, idx) => {
  //               if (idx === index) {
  //                 return value;
  //               }
  //               return item.content;
  //             });
  //             await sleep(1);
  //             setItemStrings(newItemsStrings);
  //             return true;
  //           },
  //         },
  //         {
  //           type: 'duplicate',
  //           onPrimaryAction: async (value) => {
  //             await sleep(1);
  //             duplicateView(value);
  //             return true;
  //           },
  //         },
  //         {
  //           type: 'edit',
  //         },
  //         {
  //           type: 'delete',
  //           onPrimaryAction: async () => {
  //             await sleep(1);
  //             deleteView(index);
  //             return true;
  //           },
  //         },
  //       ],
  // }));

  // const sortOptions = [
  //   { label: 'Order', value: 'order asc', directionLabel: 'Ascending' },
  //   { label: 'Order', value: 'order desc', directionLabel: 'Descending' },
  //   { label: 'Customer', value: 'customer asc', directionLabel: 'A-Z' },
  //   { label: 'Customer', value: 'customer desc', directionLabel: 'Z-A' },
  //   { label: 'Date', value: 'date asc', directionLabel: 'A-Z' },
  //   { label: 'Date', value: 'date desc', directionLabel: 'Z-A' },
  //   { label: 'Total', value: 'total asc', directionLabel: 'Ascending' },
  //   { label: 'Total', value: 'total desc', directionLabel: 'Descending' },
  // ];

  const { mode, setMode } = useSetIndexFiltersMode();
  const onHandleCancel = () => { };


  // const primaryAction =
  //   selected === 0
  //     ? {
  //       type: 'save-as',
  //       onAction: onCreateNewView,
  //       disabled: false,
  //       loading: false,
  //     }
  //     : {
  //       type: 'save',
  //       onAction: onHandleSave,
  //       disabled: false,
  //       loading: false,
  //     };



  // const filters = [
  //   {
  //     key: 'accountStatus',
  //     label: 'Account status',
  //     filter: (
  //       <ChoiceList
  //         title="Account status"
  //         titleHidden
  //         choices={[
  //           { label: 'Enabled', value: 'enabled' },
  //           { label: 'Not invited', value: 'not invited' },
  //           { label: 'Invited', value: 'invited' },
  //           { label: 'Declined', value: 'declined' },
  //         ]}
  //         selected={accountStatus || []}
  //         onChange={handleAccountStatusChange}
  //         allowMultiple
  //       />
  //     ),
  //     shortcut: true,
  //   },
  //   {
  //     key: 'taggedWith',
  //     label: 'Tagged with',
  //     filter: (
  //       <TextField
  //         label="Tagged with"
  //         value={taggedWith}
  //         onChange={handleTaggedWithChange}
  //         autoComplete="off"
  //         labelHidden
  //       />
  //     ),
  //     shortcut: true,
  //   },
  //   {
  //     key: 'moneySpent',
  //     label: 'Money spent',
  //     filter: (
  //       <RangeSlider
  //         label="Money spent is between"
  //         labelHidden
  //         value={moneySpent || [0, 500]}
  //         prefix="$"
  //         output
  //         min={0}
  //         max={2000}
  //         step={1}
  //         onChange={handleMoneySpentChange}
  //       />
  //     ),
  //   },
  // ];

  // const appliedFilters = [];
  // if (accountStatus && !isEmpty(accountStatus)) {
  //   const key = 'accountStatus';
  //   appliedFilters.push({
  //     key,
  //     label: disambiguateLabel(key, accountStatus),
  //     onRemove: handleAccountStatusRemove,
  //   });
  // }
  // if (moneySpent) {
  //   const key = 'moneySpent';
  //   appliedFilters.push({
  //     key,
  //     label: disambiguateLabel(key, moneySpent),
  //     onRemove: handleMoneySpentRemove,
  //   });
  // }
  // if (!isEmpty(taggedWith)) {
  //   const key = 'taggedWith';
  //   appliedFilters.push({
  //     key,
  //     label: disambiguateLabel(key, taggedWith),
  //     onRemove: handleTaggedWithRemove,
  //   });
  // }

  // const orders = [
  //   {
  //     id: '1020',
  //     order: (
  //       <Text as="span" variant="bodyMd" fontWeight="semibold">
  //         #1020
  //       </Text>
  //     ),
  //     date: 'Jul 20 at 4:34pm',
  //     customer: 'Jaydon Stanton',
  //     total: '$969.44',
  //     paymentStatus: <Badge progress="complete">Paid</Badge>,
  //     fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
  //   },
  //   {
  //     id: '1019',
  //     order: (
  //       <Text as="span" variant="bodyMd" fontWeight="semibold">
  //         #1019
  //       </Text>
  //     ),
  //     date: 'Jul 20 at 3:46pm',
  //     customer: 'Ruben Westerfelt',
  //     total: '$701.19',
  //     paymentStatus: <Badge progress="partiallyComplete">Partially paid</Badge>,
  //     fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
  //   },
  //   {
  //     id: '1018',
  //     order: (
  //       <Text as="span" variant="bodyMd" fontWeight="semibold">
  //         #1018
  //       </Text>
  //     ),
  //     date: 'Jul 20 at 3.44pm',
  //     customer: 'Leo Carder',
  //     total: '$798.24',
  //     paymentStatus: <Badge progress="complete">Paid</Badge>,
  //     fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
  //   },
  // ];
  const resourceName = {
    singular: 'reviews',
    plural: 'reviews',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(reviews);

  const rowMarkup = reviews.map(
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
                    <Icon source={StarFilledIcon} tone="info" key={itm} />
                    :
                    <Icon source={StarIcon} tone="info" key={itm} />
                )
              }
            </InlineStack>
          </Box>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text >
            <Link removeUnderline >
              {reviewTitle}
            </Link>
          </Text>
          <Box maxWidth="200px">
            <Text truncate>
              {reviewDescription}
            </Text>
          </Box>
          <Text>
            -{userName} on <Link removeUnderline>{productHandle}</Link>
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{datePosted}</IndexTable.Cell>
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

      </IndexTable.Row>
    ),
  );


  const promotedBulkActions = [
    {
      content: 'Publish selected reviews',
      onAction: () => publishReview(),
    },
    {
      content: 'Unpublish selected reviews',
      onAction: () => unpublishReview(),
    },
    {
      content: 'delete selected reviews',
      onAction: () => deleteReview(),
    }
  ];
  return (
    <>
      <Page>
        <TitleBar
          title={("Products")}
          actionGroups={[
            {
              title: 'Actions',
              actions: [
                {
                  content: 'View in your store',
                  onAction: () => console.log('export deleted reviews'),
                },
              ],
            },
          ]}
          secondaryActions={[
            {
              content: ("Edit product"),
              onAction: () => console.log("Secondary action"),
            },

          ]}
        />
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
                            <Icon source={StarFilledIcon} tone="info" key={itm} />
                            :
                            <Icon source={StarIcon} tone="info" key={itm} />
                        )
                      }
                    </InlineStack>
                  </Box>
                  <Text fontWeight="medium" alignment='center' variant="bodyLg" as="p" tone="subdued">
                    Rating
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
              sortOptions={[]}
              // sortSelected={sortSelected}
              queryValue={queryValue}
              queryPlaceholder="Start typing to search for reviews..."
              onQueryChange={handleFiltersQueryChange}
              onQueryClear={() => setQueryValue('')}
              // onSort={setSortSelected}
              // primaryAction={primaryAction}
              cancelAction={{
                onAction: onHandleCancel,
                disabled: false,
                loading: false,
              }}
              tabs={[]}
              // selected={selected}
              // onSelect={setSelected}
              // canCreateNewView
              // onCreateNewView={onCreateNewView}
              filters={[]}
              appliedFilters={[]}
              // onClearAll={handleFiltersClearAll}
              mode={mode}
              setMode={setMode}

           
            />
            <IndexTable
              condensed={useBreakpoints().smDown}
              resourceName={resourceName}
              itemCount={reviews.length}
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

              ]}
            >
              {rowMarkup}
            </IndexTable>
          </Box>
        </BlockStack>
        <Button onClick={() => test()}>test</Button>
      </Page>
    </>
  );

}
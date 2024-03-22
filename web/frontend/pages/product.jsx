import React from 'react'
import {
  Text, Page, Button, TextField, IndexTable, IndexFilters, useSetIndexFiltersMode,
  useIndexResourceState, ChoiceList, RangeSlider, Badge, useBreakpoints,
  Divider, Box, Link, Icon, InlineStack, Grid, BlockStack, Thumbnail, Image,
  SkeletonThumbnail
} from "@shopify/polaris";
import { ImportIcon, ExportIcon } from '@shopify/polaris-icons';
import { useTranslation, Trans } from "react-i18next";
import { TitleBar } from "@shopify/app-bridge-react";
import { useAuthenticatedFetch } from "../hooks";
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from "@shopify/app-bridge-react";
import { StarFilledIcon, StarIcon } from '@shopify/polaris-icons';
import '../css/index.css'
import emptyStar from '../assets/star-regular.svg'
import HalfStar from '../assets/star-half.svg'
import solidStar from '../assets/star-solid.svg'


export default function Product() {
  const [Loading, setLoading] = useState(true);
  const [runOnce,setRunOnce]=useState(0);
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
  const [sortSelected, setSortSelected] = useState(['starRating asc']);
  const [itemStrings, setItemStrings] = useState([
    'All Reviews',
    'Published',
    'Unpublished',
    'Spam',
  ]);


  //********useEffects********

  useEffect(() => {

    getTotalRows();
  }, [reviewStatus])

  useEffect(() => {
    getProduct();
  }, [])

  useEffect(() => {
    setLoading(true)
    getAllReviews();

  }, [queryValue, pageNumber, sortSelected, reviewStatus])

  useEffect(() => {
    setPageNumber(1);
  }, [queryValue, sortSelected, reviewStatus])

  useEffect(() => {
    setLoading(false)
    runOnce!=1 ? '' :
      tableData.map((itm) => {
        itm.reviewStatus == 'Published' ?
          setPublish((prevValue) => prevValue + 1)
          :
          setUnpublished((prevValue) => prevValue + 1)
      })

    let sum = 0;

    tableData.forEach((itm) => {
      sum += Number(itm.starRating);
    });

    const avgRating = tableData.length > 0 ? sum / tableData.length : 0;

    setTotalRating(sum);
    setAverageRating(avgRating);


  }, [tableData])


  useEffect(() => {
    !isLastPage ? setNextPage(true) : setNextPage(false)
    pageNumber != 1 ? setPrevPage(true) : setPrevPage(false)
  }, [pageNumber, queryValue, sortSelected, reviewStatus])

  // useEffect(() => {

  // }, [tableData])
  //********variables********

  const { t } = useTranslation();
  const Url = window.location.search;
  const params = new URLSearchParams(Url);
  const Id = params.get('id');
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
  const isLastPage = totalData !== recordsPerPage || pageNumber == totalPages || totalPages == 1;

  //*******functions**********

  const getProduct = () => {
    fetch(`/api/details/getProductDetails/${Id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
  }

  const createMetafield = () => {
    fetch('/api/table/getMetafields')
      .then(res => res.json())
      .then(data => console.log(data));
  }

  const deleteReview = () => {
    setPublish(0)
    setUnpublished(0)
    setRunOnce(0)
    fetch(`/api/review/deleteReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => getAllReviews());
  }

  const unSpamReview = () => {
    setPublish(0)
    setUnpublished(0)
    setRunOnce(0)
    fetch(`/api/review/unSpam/${selectedResources}`)
      .then(res => res.json())
      .then(data => getAllReviews());
  }

  const publishReview = () => {
    setPublish(0)
    setUnpublished(0)
    setRunOnce(0)
    fetch(`/api/review/publishReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => getAllReviews());

  }

  const unpublishReview = () => {
    setPublish(0)
    setUnpublished(0)
    setRunOnce(0)
    fetch(`/api/review/unpublishReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => getAllReviews());
  }

  const createTable = () => {
    fetch('/api/table/createDetailTable')
      .then(res => res.json())
      .then(data => console.log(data));
  }

  const getAllReviews = () => {
    setLoading(true);
    setRunOnce((prev)=>prev+1)
    fetch('/api/review/getProductReviews/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ queryValue, pageNumber, reviewStatus, sortSelected, Id }),
    })
      .then(res => res.json())
      .then(data => setTableData(data));


  };

  const getTotalRows = () => {
    if (reviewStatus == 'All Reviews') {
      fetch(`/api/review/totalReviews/All`)
        .then(res => res.json())
        .then(data => setTotalRows(data))
    }
    else {
      fetch(`/api/review/totalReviews/${reviewStatus}`)
        .then(res => res.json())
        .then(data => setTotalRows(data));
    }
  }

  const deleteView = (index) => {
    const newItemStrings = [...itemStrings];
    newItemStrings.splice(index, 1);
    setItemStrings(newItemStrings);
    setSelected(0);
  };

  const duplicateView = async (name) => {
    setItemStrings([...itemStrings, name]);
    setSelected(itemStrings.length);
    await sleep(1);
    return true;
  };

  const getReviews = (item) => {
    item == 'All Reviews' ?
      getAllReviews() :
      fetch(`/api/review/getReviews/${item}`)
        .then(res => res.json())
        .then(data => setTableData(data))
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
    { label: 'Rating', value: 'starRating asc', directionLabel: 'Ascending' },
    { label: 'Rating', value: 'starRating desc', directionLabel: 'Descending' },
    { label: 'Date', value: 'datePosted asc', directionLabel: 'A-Z' },
    { label: 'Date', value: 'datePosted desc', directionLabel: 'Z-A' },
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

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(tableData);


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

  const promotedBulkActions = [
    {
      content: 'Unspam selected reviews',
      onAction: () => unSpamReview(),
    },
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

  //conditional statements

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
        pagination={{
          hasPrevious: prevPage,
          hasNext: nextPage,
          onPrevious: (() => {
            pageNumber != 1 ? (setPageNumber(pageNumber - 1)) : '';
          }),
          onNext: (() => {
            !isLastPage ? (setPageNumber(pageNumber + 1)) : '';
          })
        }}
      >
        {/* <TitleBar
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
        /> */}

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
        </BlockStack>
      </Page>
    </>
  );

}

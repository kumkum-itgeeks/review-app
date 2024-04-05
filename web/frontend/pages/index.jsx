import {
  Text, Page, Button,  IndexTable, IndexFilters, useSetIndexFiltersMode, useIndexResourceState, 
  Badge, useBreakpoints, Box, Link, InlineStack, Image, Pagination,BlockStack
} from "@shopify/polaris";
import { ImportIcon, ExportIcon } from '@shopify/polaris-icons';
import { useTranslation, Trans } from "react-i18next";
import { useAuthenticatedFetch } from "../hooks";
import { useState, useCallback, useEffect } from 'react';
import { useNavigate , useToast } from "@shopify/app-bridge-react";
import emptyStar from '../assets/star-regular.svg'
import solidStar from '../assets/star-solid.svg'
import '../css/index.css'



export default function HomePage() {

  const [Loading, setLoading] = useState(true);
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
  const [sortSelected, setSortSelected] = useState(['starRating desc']);
  const [itemStrings, setItemStrings] = useState([
    'All Reviews',
    'Published',
    'Unpublished',
    'Spam',
  ]);


  //********useEffects********

  useEffect(() => {

    getTotalRows();
    setPageNumber(1);
  }, [reviewStatus])


  useEffect(() => {
    setLoading(true)
    getAllReviews();
  }, [queryValue, pageNumber, sortSelected, reviewStatus,])

  useEffect(() => {
    setPageNumber(1);
  }, [queryValue, sortSelected, reviewStatus])

  useEffect(() => {
    setLoading(false)
  }, [tableData])


  useEffect(() => {
    !isLastPage ? setNextPage(true) : setNextPage(false)
    pageNumber != 1 ? setPrevPage(true) : setPrevPage(false)
  }, [pageNumber, [], queryValue, sortSelected, reviewStatus])


  //********variables********

  const {show}=useToast();
  const { t } = useTranslation();
  const stars = [1, 2, 3, 4, 5];
  const star = 3;
  const fetch = useAuthenticatedFetch();
  const { mode, setMode } = useSetIndexFiltersMode();
  const resourceName = {
    singular: 'table', plural: 'tableData',
  };
  const appliedFilters = [];
  const Navigate = useNavigate();
  const totalData = tableData.length;
  const totalPages = totalRows / recordsPerPage;
  const isLastPage = totalData !== recordsPerPage || pageNumber == totalPages || totalPages == 1;

  //*******functions**********

  function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  }

  const createMetafield = () => {
    fetch('/api/table/createReviewTable')
      .then(res => res.json())
      .then(data => console.log(data));
    console.log('err')
  }

  const deleteReview = () => {
    fetch(`/api/review/deleteReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => {getAllReviews(),show(' review deleted ', {duration: 2000})});
  }

  const unSpamReview = () => {
    fetch(`/api/review/unSpam/${selectedResources}`)
      .then(res => res.json())
      .then(data => {getAllReviews(),show(' review unspammed! ', {duration: 2000})});
  }

  const publishReview = () => {
    fetch(`/api/review/publishReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => {getAllReviews(),show(' review published! ', {duration: 2000})});
  }

  const unpublishReview = () => {
    fetch(`/api/review/unpublishReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => {getAllReviews(),show(' review unpublished! ', {duration: 2000})});
  }

  const createTable = () => {
    fetch('/api/table/createDetailTable')
      .then(res => res.json())
      .then(data => console.log(data));
  }

  const getAllReviews = () => {
    setLoading(true);
    fetch('/api/review/getAllReviews', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ queryValue, pageNumber, reviewStatus, sortSelected }),
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


  const onHandleCancel = () => { };

  const onHandleSave = async () => {
    await sleep(1);
    return true;
  };


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

  return (
    <>
      <Page
        title="Reviews"
        secondaryActions={[
          {
            content: 'Import reviews',
            onAction: () => console.log('import reviews'),
            icon: ImportIcon
          },
          {
            content: 'Export',
            onAction: () => console.log('import reviews'),
            icon: ExportIcon
          },
        ]}

      >

        <BlockStack gap={400}>

        <Box as="div">
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

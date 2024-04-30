import {
  Text, Page, Button, IndexTable, IndexFilters, useSetIndexFiltersMode, useIndexResourceState,
  Badge, useBreakpoints, Box, Link, InlineStack, Image, Pagination, BlockStack, DropZone,
  Tag, Modal, Checkbox, Thumbnail, EmptySearchResult, Spinner
} from "@shopify/polaris";

import { ImportIcon, ExportIcon, LockIcon } from '@shopify/polaris-icons';
import { useTranslation, Trans } from "react-i18next";
import { useAuthenticatedFetch } from "../hooks";
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { MyContext } from "../components/providers/PlanProvider";
import { useNavigate, useToast } from "@shopify/app-bridge-react";
import emptyStar from '../assets/star-regular.svg'
import solidStar from '../assets/star-solid.svg'
import '../css/index.css';
import { hide } from "@shopify/app-bridge/actions/ContextualSaveBar";
import { disable } from "@shopify/app-bridge/actions/LeaveConfirmation";


export default function HomePage() {

  const [Loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(true);
  const [prevPage, setPrevPage] = useState(true);
  const [selected, setSelected] = useState(0);
  const [totalRows, setTotalRows] = useState('');
  const [tableData, setTableData] = useState([]);
  const [file, setFile] = useState([]);
  const [fileStatus, setFileStatus] = useState('');
  const [bulkSelectCount, setBulkSelectCount] = useState();
  const [importDisabled, setImportDisabled] = useState(true);
  const [importErrors, setImportErrors] = useState([]);
  const [tableCreated, setTableCreated] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [queryValue, setQueryValue] = useState('');
  const [taggedWith, setTaggedWith] = useState('');
  const [lastPage, setLastPage] = useState(false)
  const [importLoading, setImportLoading] = useState(false);
  const [recordsPerPage, setRecordsPerPage] = useState(3);
  const [moneySpent, setMoneySpent] = useState(undefined,);
  const [accountStatus, setAccountStatus] = useState(undefined,);
  const [reviewStatus, setReviewStatus] = useState('All Reviews');
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortSelected, setSortSelected] = useState(['starRating desc']);
  const [checked, setChecked] = useState(false);
  const [disableBulkActions, setDisableBulkActions] = useState(false);
  const { activePlan, planExists } = useContext(MyContext).hasPlan;
  const [itemStrings, setItemStrings] = useState([
    'All Reviews',
    'Published',
    'Unpublished',
    'Spam',
  ]);
  const [reviewObj, setReviewObj] = useState({
    Email: "",
    datePosted: "",
    location: "",
    productHandle: "",
    reply: "",
    reviewDescription: "",
    reviewStatus: "",
    reviewTitle: "",
    starRating: "",
    userName: ""
  })

  const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection, removeSelectedResources } =
    useIndexResourceState(tableData);
  //********useEffects********

  useEffect(() => {
    handleBulkActions()
  }, [selectedResources])

  useEffect(() => {
    getTotalRows()
    setPageNumber(1);

  }, [reviewStatus])

  useEffect(() => {
    if (fileStatus == 1) {
      setImportDisabled(() => false),
        setImportErrors([])
    }
    else if (fileStatus == 0) {
      setImportDisabled(() => true)
    }
    else {
      setImportDisabled(() => true)
    }
  }, [fileStatus])

  useEffect(() => {
    setLoading(true)

    getAllReviews()


  }, [queryValue, pageNumber, sortSelected, reviewStatus,])

  useEffect(() => {
    setPageNumber(1);
  }, [queryValue, sortSelected, reviewStatus])



  useEffect(() => {

    if (pageNumber === 1 && !isLastPage) {
      setNextPage(true)
      setPrevPage(false)
    }
    else if (pageNumber === 1) {
      setPrevPage(false)
      setNextPage(true)
    }
    else if (pageNumber != 1 && !isLastPage) {
      setPrevPage(true)
      setNextPage(true)
    }
    else if (isLastPage && pageNumber != 1) {
      setPrevPage(true)
      setNextPage(false)
    }
    else {
      setNextPage(true)
    }
  }, [pageNumber, queryValue, sortSelected, reviewStatus])


  //********variables********

  const { show } = useToast();
  const { t } = useTranslation();
  const stars = [1, 2, 3, 4, 5];
  const importErrorsArray = [];
  const star = 3;
  const fetch = useAuthenticatedFetch();
  const { mode, setMode } = useSetIndexFiltersMode();
  const resourceName = {
    singular: 'Review', plural: 'Reviews',
  };
  const appliedFilters = [];
  const Navigate = useNavigate();
  const totalData = tableData?.length;
  const totalPages = totalRows / recordsPerPage;
  const isLastPage = totalData !== recordsPerPage || pageNumber == totalPages || totalPages == 1;


  //*******functions**********

  const handleBulkActions = () => {
    let selected = selectedResources.length
    if (selected > 1) {
      setDisableBulkActions(true)
    }
    else {
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

  async function checkTableExistance() {
    fetch(`/api/table/checkTableExists`)
      .then(res => res.json())
      .then(tableExists => {
        if (tableExists === true) {
          ''
        }
        else {
          createAllTables()
        }
      })
      .catch(error => console.error(error));
  }
  async function createAllTables() {
    await fetch(`api/table/createReviewTable`)
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch(error => console.error(error));


    await fetch(`api/table/createDetailTable`)
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch(error => console.error(error));

    await fetch(`api/table/createDeletedReviewsTable`)
      .then((res) => res.json())
      .then((data) => { console.log(data) })
      .catch(error => console.error(error));

    await fetch(`api/settings/addSettingsData`)
      .then((res) => res.json())
      .then((data) => { console.log(data), getAllReviews() })
      .catch(error => console.error(error));

  }
  const ExportDeletedReviews = () => {
    fetch('/api/review/exportDeletedReviews')
      .then(res => res.json())
      .then(jsonData => {
        // Convert JSON data to CSV
        if (jsonData.length <= 0 || !jsonData) {
          showToast('No deleted reviews');
        }
        else {
          let csvData = jsonToCsv(jsonData); //
          // Create a CSV file and allow the user to download it
          let blob = new Blob([csvData], { type: 'text/csv' });
          let url = window.URL.createObjectURL(blob);
          let a = document.createElement('a');
          a.href = url;
          a.download = 'itgeeks-deleted-reviews.csv';
          document.body.appendChild(a);
          a.click();
        }
      })
      .catch(error => console.error(error));
  }

  function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  }


  const createMetafield = () => {
    fetch('/api/table/createReviewTable')
      .then(res => res.json())
      .then(data => (data))
      .catch(error => console.error(error));

  }

  // Function to convert CSV text to JSON
  function convertCSVtoJson(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const jsonArray = [];

    for (let i = 1; i < lines.length; i++) {
      const data = lines[i].split(',');
      const entry = {};

      for (let j = 0; j < headers.length; j++) {
        entry[headers[j].trim()] = data[j] !== undefined ? data[j].trim() : ''; // Handle undefined values
      }

      jsonArray.push(entry);
    }

    return jsonArray;
  }

  const importReviews = () => {
    setImportLoading(true)
    const reader = new FileReader();
    var ImportedReview;
    // Event listener for file reading completion
    reader.onload = async (e) => {
      const contents = e.target.result;
      ImportedReview = convertCSVtoJson(contents);
      await checkProduct(ImportedReview)
    };
    // Read the file as text
    reader.readAsText(file);

  }

  async function checkProduct(review) {
    setFileStatus('')
    setImportErrors([])
    let productHandle = review?.map((itm) => itm?.productHandle)
    let IdArr = [];
    fetch(`/api/review/checkProduct/${productHandle}`)
      .then(res => res.json())
      .then(data => {
        data?.map(async (obj, ind) => {
          let { idExists, pid } = obj;
          if (idExists == true) {
            IdArr.push(pid.slice(22))
          }
          else {

            productHandle.splice(ind, 1)
            review.splice(ind, 1)
            setImportLoading(false)
            importErrorsArray.push(Number(ind) + 2)
            setImportErrors(...[importErrorsArray])
            setFileStatus('')
          }
        })
        addReview(review, productHandle, IdArr);

      })
      .catch(error => console.error(error));

  }

  function addReview(review, handle, pidArr) {

    review?.length ?
      fetch('/api/review/addImportedReview', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ review, handle, pidArr }),
      })
        .then(res => res.json())
        .then(data => {
          setImportLoading(false),
            setFileStatus(''),
            show(' Reviews imported.', { duration: 2000 }),
            getAllReviews()
        })
        .catch((err) => {
          console.log('error :', err)
          show(' Error importing reviews.', { duration: 2000 })
        })
      :
      show(' Error importing reviews.', { duration: 2000 })

  }

  const downloadTemplate = () => {
    // Fetch the CSV file from a URL
    fetch('../assets/example-template.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(csvData => {

        // Proceed with downloading the CSV data
        let blob = new Blob([csvData], { type: 'text/csv' });
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'itgeeks-template.csv';
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error fetching CSV file:', error);
      });
  }

  const ExportReview = () => {
    fetch('/api/review/exportReviews')
      .then(res => res.json())
      .then(jsonData => {
        // Convert JSON data to CSV
        if (jsonData.length <= 0 || !jsonData) {
          showToast('No reviews to export')
        }
        else {
          let csvData = jsonToCsv(jsonData); //
          // Create a CSV file and allow the user to download it
          let blob = new Blob([csvData], { type: 'text/csv' });
          let url = window.URL.createObjectURL(blob);
          let a = document.createElement('a');
          a.href = url;
          a.download = 'itgeeks-reviews.csv';
          document.body.appendChild(a);
          a.click();
        }
      })
      .catch(error => console.error(error));

  }

  function jsonToCsv(jsonData) {
    let csv = '';
    // Get the headers
    let headers = Object.keys(jsonData[0]);
    csv += headers.join(',') + '\n';
    // Add the data
    jsonData.forEach(function (row) {
      let data = headers.map(header => JSON.stringify(row[header])).join(','); // Add JSON.stringify statement
      csv += data + '\n';
    });
    return csv;
  }

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFile(acceptedFiles[0]),

    [],
  )

  const deleteReview = () => {

    fetch(`/api/review/deleteReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(), showToast(selectedResources?.length > 1 ? ` ${selectedResources?.length} Reviews deleted.` : ` ${selectedResources?.length} Review deleted.`), updateMetafield(data), clearSelection() })
      .catch(error => console.error(error))
  }

  const unSpamReview = () => {
    fetch(`/api/review/unSpam/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(), setUpdateCount(Number(data.count), Number(data.count) > 1 ? 'Reviews unspammed.' : 'Review unspammed.', 'Reviews already unspammed.'), clearSelection() })
      .catch(error => console.error(error));
  }

  const publishReview = () => {
    fetch(`/api/review/publishReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(), setUpdateCount(Number(data.count), Number(data.count) > 1 ? 'Reviews published.' : 'Review published.', 'Reviews already published.'), updateMetafield(), clearSelection() })
      .catch(error => console.error(error));
  }

  const unpublishReview = () => {
    fetch(`/api/review/unpublishReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(), setUpdateCount(Number(data.count), Number(data.count) > 1 ? 'Reviews unpublished.' : 'Review unpublished.', 'Reviews already unpublished.'), updateMetafield(), clearSelection() })
      .catch(error => console.error(error));
  }

  const updateMetafield = (data) => {

    const productHandle = data?.productHandle;
    const productid = data?.productid;
    fetch(`/api/table/updateMetafields/${selectedResources}/${productid}/${productHandle}`)
      .then(res => res.json())
      .then(data => { console.log(data) })
      .catch(error => console.error(error));
  }
  const createTable = () => {
    fetch('/api/table/createDetailTable')
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
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
      .then(data => { setTableData(data), setLoading(false) })
      .catch(error => console.error(error));
  };

  const getTotalRows = () => {
    if (reviewStatus == 'All Reviews') {
      fetch(`/api/review/totalReviews/All`)
        .then(res => res.json())
        .then(data => setTotalRows(data))
        .catch(error => console.error(error));
    }
    else {
      fetch(`/api/review/totalReviews/${reviewStatus}`)
        .then(res => res.json())
        .then(data => setTotalRows(data))
        .catch(error => console.error(error));
    }
  }

  const handleCheckbox = useCallback(
    (newChecked) => setChecked(newChecked),
    [],
  );

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

  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

  const fileUpload = !file && <DropZone.FileUpload />;

  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => { setReviewStatus(item) },
    id: `${item}-${index}`,
    isLocked: index === 0,
  }));

  const emptyStateMarkup = (

    <EmptySearchResult
      title={'No Reviews Found !'}
      withIllustration

    />
  );

  const sortOptions = [
    { label: 'Rating', value: 'starRating asc', directionLabel: 'Ascending' },
    { label: 'Rating', value: 'starRating desc', directionLabel: 'Descending' },
    { label: 'Date', value: 'datePosted asc', directionLabel: 'A-Z' },
    { label: 'Date', value: 'datePosted desc', directionLabel: 'Z-A' },
    { label: 'Status', value: 'reviewStatus asc', directionLabel: 'A-Z' },
    { label: 'Status', value: 'reviewStatus desc', directionLabel: 'Z-A' },
  ];


  const rowMarkup = tableData?.map(
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
        <IndexTable.Cell >
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
          <Text as="span" >
            <Text tone="magic-subdued">
              {reviewTitle}
            </Text>
          </Text>
          <Box maxWidth="200px">
            <Text truncate>
              {reviewDescription}
            </Text>
          </Box>
          <Text as="span">
            -{userName} on <Text tone="magic-subdued" >{productHandle}</Text>
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
          }}

          >
            Details
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

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


  //************* conditonal statements *******************

  return (
    <>
      <Page
        title="Reviews"
        secondaryActions={[
          {
            key: 1,
            content: activePlan === 'Pro Plan' ? 'Import reviews' : <Text >Import reviews<Badge tone="attention" size="small" icon={LockIcon}>PRO</Badge></Text>,
            onAction: () => { setIsModalOpen(true), checkTableExistance() },
            icon: ImportIcon,
            disabled: activePlan === 'Pro Plan' ? false : true
          },
          {
            key: 2,
            content: 'Export',
            onAction: () => { checkTableExistance(), ExportReview() },
            icon: ExportIcon
          },
          {
            key: 3,
            content: activePlan === 'Pro Plan' ? 'Export deleted reviews' : <Text>Export deleted reviews<Badge tone="attention" size="small" icon={LockIcon}>PRO</Badge></Text>,
            onAction: () => { checkTableExistance(), ExportDeletedReviews() },
            icon: ExportIcon,
            disabled: activePlan === 'Pro Plan' ? false : true,
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
              filteringAccessibilityTooltip="Search"
              hideFilters

            />    
            <IndexTable
              hasZebraStriping={true}
              condensed={useBreakpoints().smDown}
              resourceName={resourceName}
              itemCount={tableData?.length}
              promotedBulkActions={promotedBulkActions}
              emptyState={emptyStateMarkup}
              selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
              }
              onSelectionChange={(a, b, c, d) => { handleSelectionChange(a, b, c, d) }}
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
        <Modal
          size="small"
          open={isModalOpen}
          onClose={() => { setIsModalOpen(false), setFile([]), setFileStatus(''), setImportErrors([]) }}
          title="Import reviews by CSV file"
          primaryAction={{
            content: 'import reviews',
            onAction: () => { importReviews() },
            disabled: importDisabled
          }}
          secondaryActions={[
            {
              content: 'cancel',
              onAction: () => { setIsModalOpen(false), setFile([]), setFileStatus(''), setImportErrors([]) }
            }
          ]}
        >


          <Box padding={400} >
            {
              importErrors?.map((lineNumber, ind) => {
                return <Text key={ind}>Line {lineNumber} - Error : could not find product ! </Text>
              })

            }
            <InlineStack gap={100} blockAlign="center">

              {
                importLoading === true ?
                  <>
                    <Spinner size="small" />
                    <Text as="p">
                      Importing Reviews ...
                    </Text>

                  </>
                  :
                  <>
                    <DropZone
                      onDrop={handleDropZoneDrop}
                      outline={false}
                      type="file"
                      accept=".csv"
                      onDropAccepted={() => setFileStatus(1)}
                      onDropRejected={() => setFileStatus(0)}
                    >
                      <DropZone.FileUpload />
                    </DropZone>

                    <Text as="p">
                      {
                        fileStatus === 1 ?
                          `${file?.name} (selected)`
                          :
                          fileStatus === 0 ?
                            `Select correct file type (CSV)`
                            :
                            `No file choosen`
                      }
                    </Text>
                  </>
              }
            </InlineStack>
            <Text variant="headingMd" as='h4' fontWeight="regular">
              Download our <Button variant="plain" onClick={() => downloadTemplate()} target="_blank"> CSV template </Button> to see an example of the required format.
            </Text>
          </Box>
        </Modal>
      </Page>
    </>
  );

}

import {
  Text, Page, Button, IndexTable, IndexFilters, useSetIndexFiltersMode, useIndexResourceState,
  Badge, useBreakpoints, Box, Link, InlineStack, Image, Pagination, BlockStack, DropZone,
  Tag, Modal, Checkbox, Thumbnail
} from "@shopify/polaris";
import { ImportIcon, ExportIcon } from '@shopify/polaris-icons';
import { useTranslation, Trans } from "react-i18next";
import { useAuthenticatedFetch } from "../hooks";
import React, { useState, useCallback, useEffect, Component } from 'react';
import { useNavigate, useToast } from "@shopify/app-bridge-react";
import emptyStar from '../assets/star-regular.svg'
import solidStar from '../assets/star-solid.svg'
import '../css/index.css';


export default function HomePage() {

  const [Loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(true);
  const [prevPage, setPrevPage] = useState(true);
  const [selected, setSelected] = useState(0);
  const [totalRows, setTotalRows] = useState('');
  const [tableData, setTableData] = useState([]);
  const [file, setFile] = useState([]);
  const [fileStatus, setFileStatus] = useState('');
  const [importDisabled, setImportDisabled] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [queryValue, setQueryValue] = useState('');
  const [taggedWith, setTaggedWith] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [recordsPerPage, setRecordsPerPage] = useState(3);
  const [moneySpent, setMoneySpent] = useState(undefined,);
  const [accountStatus, setAccountStatus] = useState(undefined,);
  const [reviewStatus, setReviewStatus] = useState('All Reviews');
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortSelected, setSortSelected] = useState(['starRating desc']);
  const [checked, setChecked] = useState(false);
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


  //********useEffects********

  useEffect(() => {

    getTotalRows();
    setPageNumber(1);
  }, [reviewStatus])

  useEffect(() => {
    fileStatus == 1 ?
      setImportDisabled(() => false)
      :
      fileStatus == 0 ?
        setImportDisabled(() => true)
        :
        setImportDisabled(() => true)
  }, [fileStatus])

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

  const { show } = useToast();
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
    const reader = new FileReader();
    var ImportedReview;
    // Event listener for file reading completion
    reader.onload = async (e) => {
      const contents = e.target.result;
      ImportedReview = convertCSVtoJson(contents);
      console.log('CSV file contents:', ImportedReview);
      setImportLoading(true)
      await checkProduct(ImportedReview)
    };
    // Read the file as text
    reader.readAsText(file);

  }

  async function checkProduct(review) {

    let productHandle = review.map((itm) => itm.productHandle)
    let IdArr = [];
    fetch(`/api/review/checkProduct/${productHandle}`)
      .then(res => res.json())
      .then(data => {
        data.map(async (obj , ind) => {
          let { idExists, pid } = obj;
          if (idExists == true) {
            IdArr.push(pid.slice(22))
            console.log(ind)
          }
          else {
            setImportLoading(false)
            productHandle.splice(ind,1)
            // console.log(ind)
            console.log('product not exists')
          }
        })
       addReview(review , productHandle , IdArr);
        // console.log("IdArr", IdArr)
      });
    // addReview(review , productHandle , data?.pid);

  }

  function addReview(review, handle, pidArr) {
    // let id = (pid.slice(22))
    console.log(pidArr)
    console.log(handle)
    console.log(review)
    fetch('/api/review/addImportedReview', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({review, handle, pidArr }),
    })
    .then(res => res.json())
    .then(data => {console.log(data) ,
      setImportLoading(false) ,
      show(' review Imported !', { duration: 2000 })
    })

  }

  // function addReview(review, handle, pidArr) {
  //   // let id = (pid.slice(22))
  //   console.log(pidArr)
  //   console.log(handle)
  //   console.log(review)
  //   fetch(`/api/review/addImportedReview/${JSON.stringify(review)}/${JSON.stringify(handle)}/${JSON.stringify(pidArr)}`)
  //   .then(res => res.json())
  //   .then(data => {console.log(data) ,
  //     setImportLoading(false) ,
  //     show(' review Imported !', { duration: 2000 })
  //   })

  // }

  const downloadTemplate = () => {
    console.log('csv downlaoad')
    // Fetch the CSV file from a URL
    fetch('../assets/example-template.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(csvData => {
        //  console.log('CSV data loaded:', csvData);

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
        let csvData = jsonToCsv(jsonData); //
        // Create a CSV file and allow the user to download it
        let blob = new Blob([csvData], { type: 'text/csv' });
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'itgeeks-reviews.csv';
        document.body.appendChild(a);
        a.click();
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
    // console.log(csv) //csv data console 
    return csv;
  }

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFile(acceptedFiles[0]),
    [],
  );

  const deleteReview = () => {
    fetch(`/api/review/deleteReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(), show(' review deleted ', { duration: 2000 }), updateMetafield() });
  }

  const unSpamReview = () => {
    fetch(`/api/review/unSpam/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(), show(' review unspammed! ', { duration: 2000 }) , updateMetafield()});
  }

  const publishReview = () => {
    fetch(`/api/review/publishReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(), show(' review published! ', { duration: 2000 }), updateMetafield() });
  }

  const unpublishReview = () => {
    fetch(`/api/review/unpublishReview/${selectedResources}`)
      .then(res => res.json())
      .then(data => { getAllReviews(), show(' review unpublished! ', { duration: 2000 }), updateMetafield() });
  }

  // const updateMetafield = () => {
  //   // let productHandle = review.map((itm) => itm.productHandle)
  //   // let pidArr = review.map((itm) => itm.productid)
  //   // console.log(productHandle , 'handle')
  //   // console.log(pidArr , 'pid arr')

  //   // fetch('/api/table/updateMetafields', {
  //   //   method: 'POST',
  //   //   headers: {
  //   //     Accept: 'application/json',
  //   //     'Content-Type': 'application/json'
  //   //   },
  //   //   body: JSON.stringify({ handle, pidArr }),
  //   // })
  //   // .then(res => res.json())
  //   // .then(data => {console.log(data)})
  // }
  const updateMetafield = () => {
    fetch(`/api/table/updateMetafields/${selectedResources}`)
      .then(res => res.json())
      .then(data => { console.log(data) });
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


  //************* conditonal statements *******************


  return (
    <>
      <Page
        title="Reviews"
        secondaryActions={[
          {
            content: 'Import reviews',
            onAction: () => setIsModalOpen(true),
            icon: ImportIcon
          },
          {
            content: 'Export',
            onAction: () => ExportReview(),
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
        <Modal
          // activator={activator}
          size="small"
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Import reviews by CSV file"
          primaryAction={{
            content: 'import reviews',
            onAction: () => { importReviews() },
            disabled: importDisabled
          }}
          secondaryActions={[
            {
              content: 'cancel',
              onAction: () => { setIsModalOpen(false), setFile([]), setFileStatus('') }
            }
          ]}
        >

          <Box padding={400} >
            <InlineStack gap={100} blockAlign="center">
              <DropZone
                onDrop={handleDropZoneDrop}
                outline={false}
                type="file"
                accept=".csv"
                onDropAccepted={() => setFileStatus(1)}
                onDropRejected={() => setFileStatus(0)}
              >
                {/* {fileUpload} */}
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
            </InlineStack>
            <Text variant="headingMd" as='h4' fontWeight="regular">
              Download our <Button variant="plain" onClick={() => downloadTemplate()} target="_blank"> CSV template </Button> to see an example of the required format.
            </Text>
            {/*<Checkbox
              label="Import using month/day/year date format"
              checked={checked}
              onChange={handleCheckbox}
            />*/}
          </Box>
        </Modal>
      </Page>
    </>
  );

}

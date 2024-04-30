import React, { useEffect, useState } from "react";
import {
    Badge, BlockStack, Button, Card, InlineGrid, InlineStack, Page, Text, List,
    Box, Divider, Modal
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks";
import { useNavigate, useToast } from "@shopify/app-bridge-react";
import { useContext } from "react";
import { MyContext } from "../components/providers/PlanProvider";


export default function PricingPlan() {

    const [DashboardDisabled, setDashBoardDisabled] = useState(true);
    const [modalButtonLoading, setModalButtonLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [planFunction, setPlanFunction] = useState(null);
    const [modalButtonContent, setModalButtonContent] = useState('');
    const [modalTitleContent, setModalTitleContent] = useState('');
    const [basicSelectLoading, setBasicSelectLoading] = useState(false)
    const [proSelectLoading, setProSelectLoading] = useState(false)

    const { show } = useToast();
    const Url = window.location.search;
    const params = new URLSearchParams(Url);
    const fetch = useAuthenticatedFetch();
    const chargeId = params.get('charge_id');
    const Navigate = useNavigate();
    const { activePlan } = useContext(MyContext).hasPlan;
    const { setHasPlan } = useContext(MyContext);


    //*****************functions ********************
    useEffect(() => {
        if (chargeId) {
            setProSelectLoading(true)
            fetch(`/api/table/addProPlan/${chargeId}`)
                .then((res) => res.json())
                .then((data) => {
                    setProSelectLoading(false),
                        setModalButtonLoading(false),
                        setDashBoardDisabled(false),
                        setIsModalOpen(false),
                        setHasPlan({
                            activePlan: 'Pro Plan',
                            planExists: true
                        }),
                        show(' Plan Succesfully Added ', { duration: 2000 }), Navigate('/plan')
                })
                .catch((err) => {
                    console.error('error adding plan ', err)
                })
        }

    }, [])


    const setAutoPublish=()=>{
        fetch(`/api/settings/setAutoPublish`)
            .then((res) => res.json())
            .then((data) => {
                selectBasicPlan()
            })
            .catch((err) => {
                console.error('error adding plan ', err)
            })
    }

    const selectBasicPlan = () => {

        fetch(`/api/table/addBasicPlan`)
            .then((res) => res.json())
            .then((data) => {
                setDashBoardDisabled(false),
                    setIsModalOpen(false),
                    setModalButtonLoading(false),
                    setBasicSelectLoading(false),
                    setHasPlan({
                        activePlan: 'Basic Plan',
                        planExists: true
                    }),
                    show(' Plan Succesfully Added ',
                        { duration: 2000 }),
                    setModalButtonLoading(false)
            })
            .catch((err) => {
                console.error('error adding plan ', err)
            })
    }

    const selectProPlan = () => {

        fetch(`/api/table/createSubscription`)
            .then((res) => res.json())
            .then((data) => {
                setProSelectLoading(true),
                    window.open(data.confirmationUrl, '_parent')
            })
            .catch((err) => {
                console.error('error adding plan ', err)
            })
    }



    return (
        <Page>
            <BlockStack gap={600}>
                <Box>
                </Box>
                <Box >
                    <InlineStack align="space-between">
                        <Text variant="headingXl" as="h4" >
                            Plans and Pricing
                        </Text>
                        <Button variant="primary" disabled={activePlan !== 'No Plan' ? false : DashboardDisabled} onClick={() => Navigate('/')}>
                            Dashboard
                        </Button>
                    </InlineStack>
                    <Box paddingBlock={400}>
                        <Text as="p" variant="bodyLg" fontWeight="regular">We offer 2 plans to suit your needs:
                            the Free Plan for essential features and the Premium Plan for advanced functionality and priority support.</Text>
                    </Box>
                </Box>
                <InlineStack align="center">
                    <Box>
                        <InlineGrid columns={2} gap={600} >
                            <Box>
                                <Card padding={0}>
                                    <BlockStack align="space-between">
                                        <Box>
                                            <Box background={activePlan === 'Basic Plan' ? "bg-fill-success-hover" : "bg-surface-active"} padding={300} >
                                                <InlineStack align="space-between" blockAlign="center">
                                                    <Text as="p" variant="bodyLg" tone={activePlan === 'Basic Plan' ? 'text-inverse' : ""} fontWeight="bold">
                                                        $0/month
                                                    </Text>
                                                    <Badge tone={activePlan === 'Basic Plan' ? "success" : "attention"} size="medium" >
                                                        BASIC
                                                    </Badge>
                                                </InlineStack>
                                            </Box>
                                            <Box paddingBlockStart={400} paddingInline={400}>
                                                <Box minHeight="300px">
                                                    <List type="bullet" gap="loose">
                                                        <BlockStack gap={300}>
                                                            <List.Item>Manage a substantial number of reviews. </List.Item>
                                                            <List.Item>Access review import/export features for data flexibility.</List.Item>
                                                            <List.Item>Enjoy basic customization options.</List.Item>
                                                            <List.Item>Receive responsive email support.</List.Item>
                                                            <List.Item>Easily handle essential review tasks.</List.Item>
                                                        </BlockStack>
                                                    </List>
                                                </Box>
                                            </Box>

                                        </Box>
                                        <Divider borderColor="border" />
                                        <InlineStack blockAlign="center" align="start">
                                            <Box padding={400} as="div">
                                                <Button
                                                    variant="secondary"
                                                    id="basicButton"
                                                    onClick={() => {
                                                        setIsModalOpen(true),
                                                            setPlanFunction(() => setAutoPublish),
                                                            setModalTitleContent('Want To Contiue With Basic Plan ?'),
                                                            setModalButtonContent('Select Basic Plan')
                                                    }}
                                                    disabled={activePlan === 'Basic Plan' ? true : false}
                                                    loading={basicSelectLoading}
                                                >
                                                    Select plan
                                                </Button>
                                            </Box>
                                        </InlineStack>
                                    </BlockStack>

                                </Card>
                            </Box>
                            <Box   >
                                <Card padding={0} >
                                    <BlockStack align="space-between" >

                                        <Box>
                                            <Box background={activePlan === 'Pro Plan' ? "bg-fill-success-hover" : "bg-surface-active"} padding={300}>
                                                <InlineStack align="space-between" blockAlign="center">
                                                    <Text as="p" variant="bodyLg" fontWeight="bold" tone={activePlan === 'Pro Plan' ? 'text-inverse' : ""}>
                                                        $9/month
                                                    </Text>
                                                    <Badge tone={activePlan === 'Pro Plan' ? "success" : "attention"} size="medium">
                                                        PRO
                                                    </Badge>
                                                </InlineStack>
                                            </Box>
                                            <Box paddingBlockStart={400} paddingInline={400}>
                                                <Box minHeight="300px">
                                                    <List type="bullet" gap="loose">
                                                        <BlockStack gap={300}>
                                                            <List.Item>Everything in free plan</List.Item>
                                                            <List.Item>Automatically publish reviews with built-in spam protection.</List.Item>
                                                            <List.Item>Perform bulk actions for efficient review handling.</List.Item>
                                                            <List.Item>Import endless reviews.</List.Item>
                                                            <List.Item>Export deleted reviews for comprehensive data management.</List.Item>
                                                            <List.Item>Benefit from priority support via both email and phone.</List.Item>
                                                        </BlockStack>
                                                    </List>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Divider borderColor="border" />
                                        <InlineStack blockAlign="center" align="start">
                                            <Box padding={400} as="div">
                                                <Button
                                                    variant="secondary"
                                                    id="proButton"
                                                    onClick={() => {
                                                        setIsModalOpen(true),
                                                            setPlanFunction(() => selectProPlan),
                                                            setModalTitleContent('Want To Contiue With Pro Plan ?'),
                                                            setModalButtonContent('Select Pro Plan')
                                                    }}
                                                    disabled={activePlan === 'Pro Plan' ? true : false}
                                                    loading={proSelectLoading}
                                                >
                                                    Select plan
                                                </Button>
                                            </Box>
                                        </InlineStack>
                                    </BlockStack>
                                </Card>
                            </Box>
                        </InlineGrid>
                    </Box>
                </InlineStack>
            </BlockStack>
            <Modal
                size="small"
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false) }}
                title={modalTitleContent}
                primaryAction={{
                    content: `${modalButtonContent}`,
                    onAction: () => { planFunction(), setModalButtonLoading(() => true) },
                    loading: modalButtonLoading
                }}
                secondaryActions={[
                    {
                        content: 'cancel',
                        onAction: () => { setIsModalOpen(false) }
                    }
                ]}

            >
            </Modal>
        </Page>
    )
}
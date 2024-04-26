import React from "react";
import {
    Badge, BlockStack, Button, Card, InlineGrid, InlineStack, Page, Text, List,
    Box,
    Divider
} from "@shopify/polaris";

export default function PricingPlan() {


    return (
        <Page  >
            <BlockStack gap={600}>
                <Box>
                </Box>
                <Box maxWidth="">
                <InlineStack align="space-between">
                    <Text variant="headingXl" as="h4" >
                        Plans and Pricing
                    </Text>
                    <Button variant="primary">
                        Dashboard
                    </Button>
                </InlineStack>
                <Box paddingBlock={400}>
                <Text as="p" variant="bodyLg" fontWeight="regular">We offer basic as well as pro plans.</Text>
                </Box>
                </Box>
                <InlineStack align="center">
                    <Box>
                <InlineGrid  columns={2} gap={600} >
                    <Box>
                        <Card padding={0}>
                            <BlockStack align="space-between">
                                <Box>
                                    <Box background="bg-surface-active" padding={300} >
                                        <InlineStack align="space-between" blockAlign="center">
                                            <Text as="p" variant="bodyLg" tone="" fontWeight="bold">
                                                $0/month
                                            </Text>
                                            <Badge tone="attention" size="medium">
                                                BASIC
                                            </Badge>
                                        </InlineStack>
                                    </Box>
                                    <Box paddingBlockStart={400} paddingInline={400}>
                                        <Box minHeight="300px">
                                            <List type="bullet" gap="loose">
                                                <BlockStack gap={300}>
                                                    <List.Item>No auto-publishing or spam checking features. </List.Item>
                                                    <List.Item>limit number of review to import and export</List.Item>
                                                    <List.Item>No option to export deleted reviews</List.Item>
                                                    <List.Item>No bulk action</List.Item>
                                                    <List.Item>Email support</List.Item>
                                                </BlockStack>
                                            </List>
                                        </Box>
                                    </Box>

                                </Box>
                                <Divider borderColor="border" />
                                <InlineStack blockAlign="center" align="start">
                                    <Box padding={400} as="div">
                                        <Button variant="secondary">
                                            Select
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
                                    <Box background="bg-surface-active" padding={300}>
                                        <InlineStack align="space-between" blockAlign="center">
                                            <Text as="p" variant="bodyLg" fontWeight="bold">
                                                $9/month
                                            </Text>
                                            <Badge tone="attention" size="medium">
                                                PRO
                                            </Badge>
                                        </InlineStack>
                                    </Box>
                                    <Box paddingBlockStart={400} paddingInline={400}>
                                        <Box minHeight="300px">
                                            <List type="bullet" gap="loose">
                                                <BlockStack gap={300}>
                                                    <List.Item>Auto-publishing feature with spam checking</List.Item>
                                                    <List.Item>Unlimited number of review to import and export reviews.</List.Item>
                                                    <List.Item>option to export deleted reviews</List.Item>
                                                    <List.Item>Bulk action</List.Item>
                                                    <List.Item>Priority support on call and email both</List.Item>
                                                </BlockStack>
                                            </List>
                                        </Box>
                                    </Box>
                                </Box>
                                <Divider borderColor="border" />
                                <InlineStack blockAlign="center" align="start">
                                    <Box padding={400} as="div">
                                        <Button variant="secondary">
                                            Select
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
        </Page>
    )
}
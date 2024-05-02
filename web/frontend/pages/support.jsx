import { Button, Card, InlineStack, Page, Thumbnail, Box, Text, BlockStack, CalloutCard } from '@shopify/polaris'
import React, { useState, useCallback, useEffect, useContext } from 'react'
import SupportData from '../assets/supportData.json'




export default function Support() {


    return (
        <Page>
            <Box paddingBlockEnd={600}>
            <InlineStack align="space-between">
                <Text variant="headingXl" as="h4" > Support</Text>
            </InlineStack>
            </Box>
            <BlockStack gap={200} >
                <Box paddingBlockEnd={400}>
                    {
                        SupportData.map((data, index) => {
                            const { title, description, buttonText, img } = data;
                            return (
                                <CalloutCard
                                    key={index}
                                    title={title}
                                    illustration={img}
                                    primaryAction={{
                                        content: buttonText,
                                        url: '#',
                                    }}
                                >
                                    <p>{description}</p>
                                </CalloutCard>
                            )
                        })
                    }
                </Box>
            </BlockStack>


        </Page>

    )
}


import { TitleBar } from '@shopify/app-bridge-react'
import { Page } from '@shopify/polaris'
import React from 'react'

export default function Settings() {
  return (
    <>
        <Page>
        <TitleBar
          title={("Settings")}
          primaryAction={ {
            content: ("Save"),
            onAction: () => console.log("save"),
          }}
          actionGroups={[
            {
                title: 'Actions',
                actions: [
                    {
                        content: 'Import',
                        onAction:() => console.log('import reviews'),
                    },
                    {
                        content: 'Export',
                        onAction:() => console.log('export reviews'),
                    },
                ],
            },
        ]}
          secondaryActions={[
            {
              content: ("Install instructions"),
              onAction: () => console.log("install instructions"),
            },
          ]}
        />
        </Page>
    </>
  )
}

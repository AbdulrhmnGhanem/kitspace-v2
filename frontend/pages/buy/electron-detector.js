import React from 'react'
import Product from '../../components/product'
import { Page } from '../../components/Page'

const BuyPage = () => {
  const projectLink =
    'https://kitspace.org/boards/github.com/ozel/diy_particle_detector/electron-detector/'
  return (
    <Page>
      <Product
        name="Electron Detector Kit"
        description={
          <>
            <p>
              This open hardware project is a mobile low-cost detector for measuring
              ionising radiation like electrons from beta radiation (plus some gamma
              photons). It's an educational tool and citizen science device made for
              exploring natural and synthetic sources of radioactivity such as
              stones, airborne radon, potassium-rich salt or food and every-day
              objects (Uranium glass, old Radium watches etc.).
            </p>
            <p>
              This project is developed by Oliver Keller at CERN, see full project
              details <a href={projectLink}>here.</a>
            </p>
            <p>
              This is a kit to make your own electron detector. A required metal
              enclosure (see the{' '}
              <a href="https://github.com/ozel/DIY_particle_detector/wiki/Enclosures">
                wiki
              </a>
              ) and a 9V battery are not included.
            </p>
          </>
        }
        imgUri="https://files.stripe.com/links/fl_test_85nflsKKmm8PBTGZjt98zJSn"
        price={3000}
        priceId="price_1Hi40TI6rpeFFqzwPHRltaPl"
        shippingPrice={1500}
        shippingName={
          'Worldwide Shipping (estimated delivery by ' +
          new Date(new Date().getTime() + 10 * 86400000).toLocaleDateString(
            undefined,
            {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            },
          ) + ")"
        }
        shippingPriceId="price_1Hi40LI6rpeFFqzwKKdjjpeK"
      />
    </Page>
  )
}

export default BuyPage

import AddressesDAO from "../dao/addressesDAO";
import { User } from "./users.controller";

export default class AddressesController {

    static async apiPostAddress(req, res, next) {
        try {
            const userJwt = req.get("Authorization").slice("Bearer ".length)
            const user = await User.decoded(userJwt)
            var {error} = user
            if (error) {
                res.status(401).json({error})
                return 
            }

            const keyfileId = req.body.keyfileId
            const title = req.body.title
            const trustRating = req.body.trustRating
            co
        }
    }

    static async apiGetAddresses(req, res, next) {
        const ADDRESSES_PER_PAGE = 20
        const { addressesList, totalNumAddresses } = await AddressesDAO.getAddresses()
        let response = {
            addresses = addressesList,
            page = 0,
            filters = {},
            entries_per_page: ADDRESSES_PER_PAGE,
            total_results: totalNumAddresses,
        }
        res.json(response)
    }

    static async apiGetAddressesByUser(req, res, next) {
        let users = req.query.users
        let usersList = Array.isArray(addresses) ? addresses : Array(addresses)
        let addressesList = await AddressesDAO.getAddresses({filters: {
            "users": users
        }})
        let response = {
            addresses: addressesList,
        }
        res.json(response)
    }

    static async apiGetAddressById(req, res, next) {
        try {
            let id = req.params.id || {}
            let address = await AddressesDAO.getAddressByID(id)
            if (!movie) {
                res.status(404).json({error: "Not found"})
                return
            }
            let updated_type = address.lastUpdatedDate instanceof Date ? "Date" : "other"
            res.json({address, updated_type})
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({error: e})
        }
    }

    static async apiSearchAddresses(req, res, next) {
        const ADDRESSES_PER_PAGE = 20
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : 0
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }
        let searchType
        try {
            searchType = Object.keys(req.query)[0]
        } catch (e) {
            console.error(`No search keys specified: ${e}`)
        }

        let filters = {}

        switch(searchType) {
            case "users" :
                if (req.query.users !== "") {
                    filters.users = req.query.users
                }
                break
            case "text" :
                if (req.query.text !== "") {
                    filters.text = req.query.text
                }
                break
            default:
                //nothing to do
        }

        const {addressesList, totalNumAddresses} = await AddressesDAO.getAddresses({
            filters,
            page,
            ADDRESSES_PER_PAGE
        })

        let response = {
            addresses: addressesList,
            page: page,
            filters,
            entries_per_page: ADDRESSES_PER_PAGE,
            totalResults: totalNumAddresses
        }

        res.json(response)
    }

    static async apiFacetedSearch(req, res, next) {
        const ADDRESSES_PER_PAGE = 20

        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : 0
        } catch (e) {
            console.error(`Got bad value for page, defaulting to 0: ${e}`)
            page = 0
        }

        let filters = {}
        filters = req.query.users !== ""
            ? {users: new RegExp(req.query.users, "i")}
            : {users: "Chris Georgen"}

        const facetedSearchResult = await AddressesDAO.facetedSearch(
            {
                filters,
                page,
                ADDRESSES_PER_PAGE
            }
        )

        let response = {
            addresses: facetedSearchResult.addresses,
            facets: {
                polyBalance: facetedSearchResult.polyBalance,
                trustRating: facetedSearchResult.trustRating,
            },
            page: page,
            filters,
            entries_per_page: ADDRESSES_PER_PAGE,
            total_results: facetedSearchResult.count,
        }

        res.json(response)

    }

    static async getConfig(req, res, next) {
        const { poolSize, wtimeout, authInfo} = await AddressesDAO.getConfiguration()
        try {
            let response = {
                pool_size: poolSize,
                wtimeout,
                ...authInfo,
            }
            res.json(response)
        } catch(e) {
            res.status(500).json({error:e})
        }
    }

}
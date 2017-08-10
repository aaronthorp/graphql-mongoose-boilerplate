import _ from 'lodash'
import catResolvers from './catResolvers'

const allResolvers = [
    catResolvers
]

const mergedResolvers = {}

_.map(allResolvers, function (resolverShard) {
  _.map(resolverShard, function (resolvers, outerKey) {

    if (mergedResolvers[outerKey] === undefined) {
      mergedResolvers[outerKey] = {};
    }

    _.map(resolvers, function (resolver, innerKey) {
      mergedResolvers[outerKey][innerKey] = resolver;
    })
  })
})

export default mergedResolvers
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const db = require('../../models');
const { NotFoundError } = require('../../utils/coreErrors');

const DEFAULT_OPTIONS = {
  skip: 0,
  order_dir: 'ASC',
  order_by: 'name',
};

/**
 * @description Get list of device
 * @param {Object} [options] - Options of the query.
 * @example
 * const devices = await gladys.device.get({
 *  take: 20,
 *  skip: 0
 * });
 */
async function get(options) {
  const optionsWithDefault = Object.assign({}, DEFAULT_OPTIONS, options);

  const queryParams = {
    include: [
      {
        model: db.DeviceFeature,
        as: 'features',
      },
      {
        model: db.DeviceParam,
        as: 'params',
      },
      {
        model: db.Room,
        as: 'room',
      },
      {
        model: db.Service,
        as: 'service',
      },
    ],
    offset: optionsWithDefault.skip,
    order: [[optionsWithDefault.order_by, optionsWithDefault.order_dir]],
  };

  // fix attributes
  if(optionsWithDefault.attributes_device && optionsWithDefault.attributes_device.length > 0){
    queryParams.attributes = optionsWithDefault.attributes_device;
  }
  if(optionsWithDefault.attributes_device_feature && optionsWithDefault.attributes_device_feature.length > 0){
    queryParams.include[0].attributes = optionsWithDefault.attributes_device_feature;
  }
  if(optionsWithDefault.attributes_device_param && optionsWithDefault.attributes_device_param.length > 0){
    queryParams.include[1].attributes = optionsWithDefault.attributes_device_param;
  }
  if(optionsWithDefault.attributes_device_room && optionsWithDefault.attributes_device_room.length > 0){
    queryParams.include[2].attributes = optionsWithDefault.attributes_device_room;
  }
  if(optionsWithDefault.attributes_device_service && optionsWithDefault.attributes_device_service.length > 0){
    queryParams.include[3].attributes = optionsWithDefault.attributes_device_service;
  }
  // search by device feature category
  if (optionsWithDefault.device_feature_category) {
    queryParams.include[0].where = {
      category: optionsWithDefault.device_feature_category,
    };
  }

  // search by feature selector
  if (optionsWithDefault.device_feature_selector) {
    queryParams.include[0].where = {
      selector: { [Op.in]: optionsWithDefault.device_feature_selector },
    };
  }

  // search by device feature type
  if (optionsWithDefault.device_feature_type) {
    const condition = {
      type: optionsWithDefault.device_feature_type,
    };
    queryParams.include[0].where = queryParams.include[0].where
      ? Sequelize.and(queryParams.include[0].where, condition)
      : condition;
  }

  // take is not a default
  if (optionsWithDefault.take !== undefined) {
    queryParams.limit = optionsWithDefault.take;
  }

  if (optionsWithDefault.search) {
    queryParams.where = {
      [Op.or]: [
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('t_device.name')), {
          [Op.like]: `%${optionsWithDefault.search}%`,
        }),
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('t_device.external_id')), {
          [Op.like]: `%${optionsWithDefault.search}%`,
        }),
      ],
    };
  }

  if (optionsWithDefault.service) {
    const service = await this.serviceManager.getLocalServiceByName(optionsWithDefault.service);
    if (!service) {
      throw new NotFoundError('SERVICE_NOT_FOUND');
    }
    const condition = {
      service_id: service.id,
    };
    queryParams.where = queryParams.where ? Sequelize.and(queryParams.where, condition) : condition;
  }

  if (optionsWithDefault.model) {
    const condition = {
      model: optionsWithDefault.model,
    };
    queryParams.where = queryParams.where ? Sequelize.and(queryParams.where, condition) : condition;
  }

  const devices = await db.Device.findAll(queryParams);

  const devicesPlain = devices.map((device) => device.get({ plain: true }));

  return devicesPlain;
}

module.exports = {
  get,
};

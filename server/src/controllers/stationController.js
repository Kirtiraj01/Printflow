import StationConfig from '../models/StationConfig.js';
import { runSeed } from '../../scripts/seed.js';

export const getStationStatus = async (req, res, next) => {
  try {
    const station = await StationConfig.findOne({ stationId: 'desk-2' });
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station configuration not found.' });
    }
    res.json({
      success: true,
      stationName: station.stationName,
      isOpen: station.isOpen,
      printerModel: station.printerModel,
      printerStatus: station.printerStatus,
      trayLevelA4: station.trayLevelA4,
      tonerLevel: station.tonerLevel,
      rates: station.rates,
    });
  } catch (err) {
    next(err);
  }
};

export const resetDemoData = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Demo reset is forbidden in production environment.',
      });
    }

    await runSeed();

    res.json({
      success: true,
      message: 'Demo data reset successfully. Database and sample files refreshed.',
    });
  } catch (err) {
    next(err);
  }
};

export const updateStationConfig = async (req, res, next) => {
  try {
    const { stationName, isOpen, printerModel, printerStatus, trayLevelA4, tonerLevel, rates } = req.body;

    let station = await StationConfig.findOne({ stationId: 'desk-2' });
    if (!station) {
      station = new StationConfig({ stationId: 'desk-2' });
    }

    if (stationName !== undefined) station.stationName = stationName.trim();
    if (isOpen !== undefined) station.isOpen = Boolean(isOpen);
    if (printerModel !== undefined) station.printerModel = printerModel.trim();
    if (printerStatus !== undefined) station.printerStatus = printerStatus;
    if (trayLevelA4 !== undefined) station.trayLevelA4 = Number(trayLevelA4);
    if (tonerLevel !== undefined) station.tonerLevel = tonerLevel;
    if (rates !== undefined) {
      if (!station.rates) station.rates = {};
      if (rates.bwPerPage !== undefined) station.rates.bwPerPage = Number(rates.bwPerPage);
      if (rates.colorPerPage !== undefined) station.rates.colorPerPage = Number(rates.colorPerPage);
      if (rates.a3Multiplier !== undefined) station.rates.a3Multiplier = Number(rates.a3Multiplier);
    }

    await station.save();

    res.json({
      success: true,
      stationName: station.stationName,
      isOpen: station.isOpen,
      printerModel: station.printerModel,
      printerStatus: station.printerStatus,
      trayLevelA4: station.trayLevelA4,
      tonerLevel: station.tonerLevel,
      rates: station.rates,
    });
  } catch (err) {
    next(err);
  }
};


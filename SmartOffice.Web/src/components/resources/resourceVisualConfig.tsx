import type {
  Asset,
} from '../../stores/AssetStore'

export interface ResourceVisualConfig {
  key: string
  label: string
  fileName: string
}

export function getResourceVisualConfig(
  resource: Asset
): ResourceVisualConfig {
  const name =
    resource.name
      .trim()
      .toLowerCase()

  const category =
    resource.category
      .trim()
      .toLowerCase()

  // =========================================
  // EQUIPMENT
  // =========================================

  if (
    category.includes(
      'headset'
    ) ||
    name.includes(
      'jabra'
    )
  ) {
    return {
      key: 'headset',
      label: 'Wireless Headset',
      fileName: 'headset.gif',
    }
  }

  if (
    category.includes(
      'webcam'
    ) ||
    name.includes(
      'brio'
    )
  ) {
    return {
      key: 'webcam',
      label: 'Webcam',
      fileName: 'webcam.gif',
    }
  }

  if (
    category.includes(
      'docking'
    ) ||
    name.includes(
      'dock'
    )
  ) {
    return {
      key: 'docking-station',
      label: 'Docking Station',
      fileName: 'docking-station.gif',
    }
  }

  if (
    name.includes(
      'hdmi'
    )
  ) {
    return {
      key: 'hdmi-cable',
      label: 'HDMI Cable Kit',
      fileName: 'hdmi-cable.gif',
    }
  }

  if (
    category.includes(
      'portable monitor'
    ) ||
    name.includes(
      'zenscreen'
    )
  ) {
    return {
      key: 'portable-monitor',
      label: 'Portable Monitor',
      fileName: 'portable-monitor.gif',
    }
  }

  if (
    category.includes(
      'keyboard'
    ) ||
    name.includes(
      'mx keys'
    )
  ) {
    return {
      key: 'keyboard-mouse',
      label: 'Keyboard & Mouse',
      fileName: 'keyboard-mouse.gif',
    }
  }

  if (
    category.includes(
      'presentation'
    )
  ) {
    return {
      key: 'presentation-kit',
      label: 'Presentation Kit',
      fileName: 'presentation-kit.gif',
    }
  }

  // =========================================
  // DESKS
  // =========================================

  if (
    category.includes(
      'standing'
    )
  ) {
    return {
      key: 'standing-desk',
      label: 'Standing Desk',
      fileName: 'standing-desk.gif',
    }
  }

  if (
    category.includes(
      'dual monitor'
    )
  ) {
    return {
      key: 'dual-monitor-desk',
      label: 'Dual Monitor Desk',
      fileName: 'dual-monitor-desk.gif',
    }
  }

  if (
    category.includes(
      'window'
    )
  ) {
    return {
      key: 'window-desk',
      label: 'Window Desk',
      fileName: 'window-desk.gif',
    }
  }

  if (
    category.includes(
      'focus'
    )
  ) {
    return {
      key: 'focus-desk',
      label: 'Focus Desk',
      fileName: 'focus-desk.gif',
    }
  }

  if (
    resource.type ===
    'Desk'
  ) {
    return {
      key: 'desk',
      label: 'Office Desk',
      fileName: 'desk.gif',
    }
  }

  // =========================================
  // SHARED RESOURCES
  // =========================================

  if (
    category.includes(
      'printer'
    )
  ) {
    return {
      key: 'printer',
      label: 'Printer Station',
      fileName: 'printer.gif',
    }
  }

  if (
    category.includes(
      'parking'
    )
  ) {
    return {
      key: 'parking',
      label: 'Parking Spot',
      fileName: 'parking.gif',
    }
  }

  if (
    category.includes(
      'storage'
    )
  ) {
    return {
      key: 'storage-cabinet',
      label: 'Storage Cabinet',
      fileName: 'storage-cabinet.gif',
    }
  }

  if (
    category.includes(
      'visitor'
    )
  ) {
    return {
      key: 'visitor-kit',
      label: 'Visitor Kit',
      fileName: 'visitor-kit.gif',
    }
  }

  // =========================================
  // FALLBACKS
  // =========================================

  if (
    resource.type ===
    'Equipment'
  ) {
    return {
      key: 'equipment',
      label: 'Office Equipment',
      fileName: 'equipment.gif',
    }
  }

  return {
    key: 'shared-resource',
    label: 'Shared Resource',
    fileName: 'shared-resource.gif',
  }
}
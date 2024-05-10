import AddPersonModal from './AddPersonModal';
import CreateSiteModal from '../(dashboard)/prepare/sites/CreateSiteModal';
import SendAlertModal from './SendAlertModal';
import SiteInfoModal from "./SiteInfoModal";

export enum ModalNames {
  SendAlert = 'sendAlert',
  AddPerson = 'addPerson',
  SiteInfo = 'siteInfo',
}

export const APP_MODALS: Record<ModalNames, React.ReactComponentElement> = {
  [ModalNames.SendAlert]: SendAlertModal,
  [ModalNames.AddPerson]: AddPersonModal,
  [ModalNames.SiteInfo]: SiteInfoModal,
};

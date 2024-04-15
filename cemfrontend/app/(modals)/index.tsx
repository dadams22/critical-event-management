import AddPersonModal from './AddPersonModal';
import CreateSiteModal from './CreateSiteModal';
import SendAlertModal from './SendAlertModal';

export enum ModalNames {
	SendAlert = 'sendAlert',
	AddPerson = 'addPerson',
	CreateSite = 'createSite',
}

export const APP_MODALS: Record<ModalNames, React.ReactComponentElement> = {
	[ModalNames.SendAlert]: SendAlertModal,
	[ModalNames.AddPerson]: AddPersonModal,
	[ModalNames.CreateSite]: CreateSiteModal,
};

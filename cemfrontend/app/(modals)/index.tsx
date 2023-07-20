import AddPersonModal from './AddPersonModal';
import SendAlertModal from './SendAlertModal';

export enum ModalNames {
	SendAlert = 'sendAlert',
	AddPerson = 'addPerson',
}

export const APP_MODALS: Record<ModalNames, React.ReactComponentElement> = {
	[ModalNames.SendAlert]: SendAlertModal,
	[ModalNames.AddPerson]: AddPersonModal,
};

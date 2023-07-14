import SendAlertModal from './SendAlertModal';

export enum ModalNames {
	SendAlert = 'sendAlert',
}

export const APP_MODALS: Record<ModalNames, React.ReactComponentElement> = {
	[ModalNames.SendAlert]: SendAlertModal,
};

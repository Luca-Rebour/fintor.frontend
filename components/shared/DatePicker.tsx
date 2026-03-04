import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

type AppDatePickerProps = {
	label: string;
	value: string;
	placeholder: string;
	disabled?: boolean;
	iosTitle?: string;
	cancelLabel?: string;
	doneLabel?: string;
	onChange: (nextDate: string) => void;
};

function formatDateForForm(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function resolveDateFromForm(value: string): Date {
	const parsedDate = new Date(`${value}T00:00:00`);

	if (!value || Number.isNaN(parsedDate.getTime())) {
		return new Date();
	}

	return parsedDate;
}

export function AppDatePicker({
	label,
	value,
	placeholder,
	disabled = false,
	iosTitle,
	cancelLabel = "Cancelar",
	doneLabel = "Listo",
	onChange,
}: AppDatePickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [draftDate, setDraftDate] = useState(resolveDateFromForm(value));

	useEffect(() => {
		if (!isOpen) {
			setDraftDate(resolveDateFromForm(value));
		}
	}, [value, isOpen]);

	function openPicker() {
		if (disabled) {
			return;
		}

		setDraftDate(resolveDateFromForm(value));
		setIsOpen(true);
	}

	function closePicker() {
		setIsOpen(false);
	}

	function applySelectedDate(nextDate: Date) {
		onChange(formatDateForForm(nextDate));
	}

	function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
		if (event.type === "dismissed") {
			if (Platform.OS !== "ios") {
				closePicker();
			}
			return;
		}

		if (!selectedDate) {
			return;
		}

		if (Platform.OS === "ios") {
			setDraftDate(selectedDate);
			return;
		}

		applySelectedDate(selectedDate);
		closePicker();
	}

	return (
		<View className="mt-3">
			<Text className="text-app-textSecondary text-xs uppercase mb-2">{label}</Text>
			<Pressable
				onPress={openPicker}
				disabled={disabled}
				className="rounded-xl border border-[#1E2A47] bg-[#0C1830] px-3 py-3"
			>
				<Text className={`text-base ${value ? "text-app-textPrimary" : "text-[#64748B]"}`}>
					{value || placeholder}
				</Text>
			</Pressable>

			{isOpen && Platform.OS !== "ios" ? (
				<DateTimePicker
					value={resolveDateFromForm(value)}
					mode="date"
					display="default"
					onChange={handleDateChange}
				/>
			) : null}

			{isOpen && Platform.OS === "ios" ? (
				<Modal visible transparent animationType="slide" onRequestClose={closePicker}>
					<View className="flex-1 justify-end bg-[#060F24]/70">
						<Pressable className="flex-1" onPress={closePicker} />

						<View className="rounded-t-3xl border border-[#1E2A47] bg-[#060F24] px-4 pb-6 pt-3">
							<View className="mb-2 flex-row items-center justify-between">
								<Pressable onPress={closePicker} className="px-2 py-2">
									<Text className="text-sm font-semibold text-[#94A3B8]">{cancelLabel}</Text>
								</Pressable>

								<Text className="text-sm font-semibold text-app-textPrimary">
									{iosTitle || label}
								</Text>

								<Pressable
									onPress={() => {
										applySelectedDate(draftDate);
										closePicker();
									}}
									className="px-2 py-2"
								>
									<Text className="text-sm font-semibold text-[#18C8FF]">{doneLabel}</Text>
								</Pressable>
							</View>

							<DateTimePicker value={draftDate} mode="date" display="spinner" onChange={handleDateChange} />
						</View>
					</View>
				</Modal>
			) : null}
		</View>
	);
}


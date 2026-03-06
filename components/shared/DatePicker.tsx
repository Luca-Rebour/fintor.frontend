import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { AppBottomSheetModal } from "./AppBottomSheetModal";

type AppDatePickerProps = {
	label: string;
	value: string;
	placeholder: string;
	disabled?: boolean;
	initialDate?: Date;
	minimumDate?: Date;
	maximumDate?: Date;
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

function resolveDateFromForm(value: string, fallbackDate: Date): Date {
	const normalizedValue = String(value ?? "").trim();
	const matchedDateParts = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

	if (!matchedDateParts) {
		return fallbackDate;
	}

	const year = Number(matchedDateParts[1]);
	const month = Number(matchedDateParts[2]);
	const day = Number(matchedDateParts[3]);
	const parsedDate = new Date(year, month - 1, day);

	if (Number.isNaN(parsedDate.getTime())) {
		return fallbackDate;
	}

	if (
		parsedDate.getFullYear() !== year ||
		parsedDate.getMonth() !== month - 1 ||
		parsedDate.getDate() !== day
	) {
		return fallbackDate;
	}

	return parsedDate;
}

export function AppDatePicker({
	label,
	value,
	placeholder,
	disabled = false,
	initialDate,
	minimumDate,
	maximumDate,
	iosTitle,
	cancelLabel = "Cancelar",
	doneLabel = "Listo",
	onChange,
}: AppDatePickerProps) {
	const fallbackDate = useMemo(() => {
		if (initialDate instanceof Date && !Number.isNaN(initialDate.getTime())) {
			return new Date(initialDate.getTime());
		}

		return new Date();
	}, [initialDate?.getTime()]);
	const [isOpen, setIsOpen] = useState(false);
	const [draftDate, setDraftDate] = useState(resolveDateFromForm(value, fallbackDate));

	useEffect(() => {
		if (!isOpen) {
			setDraftDate(resolveDateFromForm(value, fallbackDate));
		}
	}, [value, isOpen, fallbackDate]);

	function openPicker() {
		if (disabled) {
			return;
		}

		setDraftDate(resolveDateFromForm(value, fallbackDate));
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

		setDraftDate(selectedDate);
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
					value={draftDate}
					mode="date"
					display="default"
					minimumDate={minimumDate}
					maximumDate={maximumDate}
					onChange={handleDateChange}
				/>
			) : null}

			{isOpen && Platform.OS === "ios" ? (
				<AppBottomSheetModal visible={isOpen} onClose={closePicker} snapPoints={["40%"]} debugName="AppDatePicker:IOS">
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

						<DateTimePicker
							value={draftDate}
							mode="date"
							display="spinner"
							minimumDate={minimumDate}
							maximumDate={maximumDate}
							onChange={handleDateChange}
						/>
						</View>
				</AppBottomSheetModal>
			) : null}
		</View>
	);
}


import TextRecognition from "@react-native-ml-kit/text-recognition";
import * as ImagePicker from "expo-image-picker";

export interface OcrResult {
  text: string;
  blocks: Array<{ text: string; lines: Array<{ text: string }> }>;
}

export async function pickImageFromLibrary(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsEditing: false,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri ?? null;
}

export async function recognizeTextFromImage(imageUri: string): Promise<OcrResult> {
  const result = await TextRecognition.recognize(imageUri);

  const blocks = (result.blocks ?? []).map((block: any) => ({
    text: block.text ?? "",
    lines: (block.lines ?? []).map((line: any) => ({
      text: line.text ?? "",
    })),
  }));

  return {
    text: result.text ?? "",
    blocks,
  };
}

export async function extractTextFromSelectedImage(): Promise<string | null> {
  const imageUri = await pickImageFromLibrary();
  if (!imageUri) {
    return null;
  }

  const recognized = await recognizeTextFromImage(imageUri);
  return recognized.text.trim() || null;
}

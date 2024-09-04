import React, { ForwardedRef, forwardRef } from "react";
import {
  Button,
  FileObject,
  HStack,
  List,
  Modal,
  Textarea,
  TextField,
  UNSAFE_Combobox,
  UNSAFE_FileUpload,
  VStack,
} from "@navikt/ds-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { TrashIcon } from "@navikt/aksel-icons";
import styles from "./NyAvtaleModal.module.css";

interface Props {
  submit: (formData: FormData) => void;
}

interface MetadataFormData {
  name: string;
  replacementMap: Record<string, string>;
  ingress: string;
  ingressNynorsk: string;
  kvitteringstekst: string;
  kvitteringstekstNynorsk: string;
}

interface FormValues {
  name: string;
  files: FileObject[];
  examplePdfs: FileObject[];
  map: [string, string][];
  ingress: string;
  ingressNynorsk: string;
  kvitteringstekst: string;
  kvitteringstekstNynorsk: string;
}

const options = [
  { label: "Kommunenavn", value: "KOMMUNENAVN" },
  { label: "Kommunens orgnr", value: "KOMMUNEORGNR" },
  { label: "Dato", value: "DATO" },
];

const defaultValues: FormValues = {
  files: [],
  examplePdfs: [],
  map: [["", ""]],
  name: "",
  ingress: "",
  ingressNynorsk: "",
  kvitteringstekst: "",
  kvitteringstekstNynorsk: "",
};
const NyAvtalemalModal = (
  { submit }: Props,
  ref: ForwardedRef<HTMLDialogElement>,
): React.JSX.Element => {
  const {
    register,
    handleSubmit,
    control,
    resetField,
    watch,
    formState,
    reset,
  } = useForm<FormValues>({
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "map" });

  const close = () => {
    reset(defaultValues);
    if (typeof ref === "function") {
      ref(null);
    } else {
      ref?.current?.close();
    }
  };
  const onSubmit = (data: FormValues) => {
    const formData = new FormData();
    formData.append("file", data.files[0].file, data.files[0].file.name);
    formData.append(
      "examplePdf",
      data.examplePdfs[0].file,
      data.examplePdfs[0].file.name,
    );
    formData.append(
      "metadata",
      JSON.stringify({
        name: data.name,
        replacementMap: Object.fromEntries(data.map),
        ingress: data.ingress,
        ingressNynorsk: data.ingressNynorsk,
        kvitteringstekst: data.kvitteringstekst,
        kvitteringstekstNynorsk: data.kvitteringstekstNynorsk,
      } satisfies MetadataFormData),
    );
    submit(formData);
    close();
  };

  return (
    <Modal ref={ref} header={{ heading: "Ny avtalemal" }} onClose={close}>
      <Modal.Body style={{ width: "700px" }}>
        <form id="ny-avtalemal" onSubmit={handleSubmit(onSubmit)}>
          <VStack gap="4">
            <TextField
              label="Navn"
              error={formState.errors.name?.message}
              {...register("name", {
                required: "Påkrevd",
                maxLength: { value: 80, message: "Maks 80 tegn" },
              })}
            />
            <HStack gap="2">
              <Textarea
                label={"Avtalebeskrivelse bokmål"}
                {...register("ingress")}
                className={styles.textarea}
              />
              <Textarea
                label={"Avtalebeskrivelse nynorsk"}
                {...register("ingressNynorsk")}
                className={styles.textarea}
              />
            </HStack>
            <HStack gap="2">
              <Textarea
                label={"Kvitteringstekst bokmål"}
                {...register("kvitteringstekst")}
                className={styles.textarea}
              />
              <Textarea
                label={"Kvitteringstekst nynorsk"}
                {...register("kvitteringstekstNynorsk")}
                className={styles.textarea}
              />
            </HStack>
            <VStack gap="2">
              <Controller
                rules={{
                  required: "Påkrevd",
                  minLength: { value: 1, message: "Må laste opp fil" },
                }}
                render={({ field, fieldState }) => (
                  <UNSAFE_FileUpload.Dropzone
                    label="Last opp avtalemalen her"
                    fileLimit={{ max: 1, current: field.value.length }}
                    multiple={false}
                    accept={".docx"}
                    onSelect={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
                name={"files"}
                shouldUnregister={false}
                control={control}
              />
              {watch("files").map((file) => (
                <UNSAFE_FileUpload.Item
                  key={file.file.name}
                  file={file.file}
                  button={{
                    action: "delete",
                    onClick: () => resetField("files", { defaultValue: [] }),
                  }}
                />
              ))}
              <Controller
                rules={{
                  required: "Påkrevd",
                  minLength: { value: 1, message: "Må laste opp fil" },
                }}
                render={({ field, fieldState }) => (
                  <UNSAFE_FileUpload.Dropzone
                    label="Last opp eksempelavtale her"
                    fileLimit={{ max: 1, current: field.value.length }}
                    multiple={false}
                    accept={".pdf"}
                    onSelect={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
                name={"examplePdfs"}
                control={control}
              />
              {watch("examplePdfs").map((file) => (
                <UNSAFE_FileUpload.Item
                  key={file.file.name}
                  file={file.file}
                  button={{
                    action: "delete",
                    onClick: () =>
                      resetField("examplePdfs", { defaultValue: [] }),
                  }}
                />
              ))}
            </VStack>
            <List title="Erstatninger">
              {fields.map((item, index) => {
                return (
                  <li key={item.id}>
                    <HStack justify="space-between" align="center">
                      <TextField
                        label="verdi"
                        error={formState.errors.map?.[index]?.["0"]?.message}
                        {...register(`map.${index}.0`, { required: "Påkrevd" })}
                      />
                      <Controller
                        name={`map.${index}.1`}
                        control={control}
                        rules={{ required: "Påkrevd" }}
                        render={({ field, fieldState }) => (
                          <UNSAFE_Combobox
                            allowNewValues={false}
                            error={fieldState.error?.message}
                            onToggleSelected={(option, isSelected) => {
                              if (isSelected) {
                                field.onChange(option);
                              } else {
                                field.onChange(undefined);
                              }
                            }}
                            label="hva"
                            options={options}
                          />
                        )}
                      />
                      <Button
                        onClick={() => remove(index)}
                        icon={<TrashIcon />}
                        variant="danger"
                        size={"small"}
                      />
                    </HStack>
                  </li>
                );
              })}
            </List>
            <Button type="button" onClick={() => append([["", ""]])}>
              Ny rad
            </Button>
          </VStack>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" form="ny-avtalemal">
          Kjør på
        </Button>
        <Button type="button" variant="secondary" onClick={close}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default forwardRef<HTMLDialogElement, Props>(NyAvtalemalModal);

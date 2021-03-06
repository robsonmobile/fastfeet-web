import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import PropTypes from 'prop-types';
import * as Yup from 'yup';

import { SaveButton, BackButton } from '~/components/Button';
import { SimpleInput, MaskInput } from '~/components/Form';
import HeaderForm from '~/components/HeaderForm';
import api from '~/services/api';
import history from '~/services/history';

import { Container, Content, UnForm } from './styles';

export default function RecipientForm({ match }) {
  const { id } = match.params;
  const formRef = useRef();

  useEffect(() => {
    async function loadInitialData() {
      if (id) {
        const response = await api.get(`/recipients/${id}`);

        formRef.current.setData(response.data);
      }
    }
    loadInitialData();
  }, [id]);

  async function handleSubmit(data, { reset }) {
    formRef.current.setErrors({});

    try {
      const schema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        street: Yup.string().required('Street is required'),
        number: Yup.string().required('Number is required'),
        complement: Yup.string().notRequired(),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        zip_code: Yup.string().required('Zip-code is required'),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      console.tron.log(id);

      if (id) {
        await api.put(`/recipients/${id}`, {
          name: data.name,
          street: data.street,
          number: data.number,
          complement: data?.complement,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
        });
        toast.success('Recipient updated successful!');
        history.push('/recipients');
      } else {
        await api.post('/recipients', {
          name: data.name,
          street: data.street,
          number: data.number,
          complement: data?.complement,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
        });
        toast.success('Recipient criated successful!');
      }

      reset();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errorMessages = {};

        err.inner.forEach((error) => {
          errorMessages[error.path] = error.message;
        });

        formRef.current.setErrors(errorMessages);
      }
    }
  }

  return (
    <Container>
      <Content>
        <HeaderForm title="Recipient register">
          <BackButton />
          <SaveButton action={() => formRef.current.submitForm()} />
        </HeaderForm>

        <UnForm ref={formRef} onSubmit={handleSubmit}>
          <SimpleInput
            label="Name"
            name="name"
            type="text"
            placeholder="Recipient name"
          />
          <div>
            <SimpleInput
              label="Rua"
              name="street"
              type="text"
              placeholder="Recipient street"
            />
            <SimpleInput
              label="Number"
              name="number"
              type="number"
              placeholder="house number"
            />
            <SimpleInput label="Complement" name="complement" type="text" />
          </div>
          <div>
            <SimpleInput
              label="City"
              name="city"
              type="text"
              placeholder="Recipient city"
            />
            <SimpleInput
              label="State"
              name="state"
              type="text"
              placeholder="Recipient state"
            />
            <MaskInput
              label="ZIP"
              name="zip_code"
              mask="99999-999"
              maskPlaceholder={null}
              placeholder="_____-___"
              onKeyPress={(e) =>
                e.key === 'Enter' ? formRef.current.submitForm() : null
              }
            />
          </div>
        </UnForm>
      </Content>
    </Container>
  );
}

RecipientForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

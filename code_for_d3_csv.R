library(dplyr)
library(readr)
library(tidyverse)


#Here we are going to manipulate the data we want to show in our D3 visualization.

#We begin by loading the dataframe and renaming some columns for easier handling
cdc_dataset = read_csv("NCHS_Leading_Causes_of_Death_United_States_2020.csv")
cdc_dataset <- cdc_dataset %>% rename(Cause = `Cause Name`)
cdc_dataset <- cdc_dataset %>% rename(Age_Adj_Rate = `Age Adjusted Rate`)
cdc_dataset <- cdc_dataset %>% rename(Crude_Rate = `Crude Rate`)
cdc_dataset <- cdc_dataset |> mutate_all(~ifelse(is.na(.), 0, .))
cdc_dataset <- cdc_dataset |> select(-`113 Cause Name`)
cdc_dataset2 <- cdc_dataset[cdc_dataset$State == "United States", ]
top_10 <- cdc_dataset2 |> group_by(Cause) |> summarize(Total_Deaths = sum(Deaths)) |>
  arrange(desc(Total_Deaths)) |> slice_max(order_by = Total_Deaths, n = 10)
top_10 <- top_10$Cause


#We will calculate how each cause has changed over time, getting out the effect of population growth:
df <- cdc_dataset |> select(Year, Cause, State, Age_Adj_Rate) |> filter(Cause %in% top_10)

#Calculate percentage growth
df <- df |> group_by(State, Cause) |>
    summarize(
    EarliestRate = first(Age_Adj_Rate, order_by = Year),
    LatestRate = last(Age_Adj_Rate, order_by = Year),
    Growth = (LatestRate - EarliestRate) / EarliestRate
  ) |> ungroup()

##Mapping
state_abbreviations <- c(
  'Alabama' = 'AL', 'Alaska' = 'AK', 'Arizona' = 'AZ', 'Arkansas' = 'AR', 'California' = 'CA',
  'Colorado' = 'CO', 'Connecticut' = 'CT', 'Delaware' = 'DE', 'Florida' = 'FL', 'Georgia' = 'GA',
  'Hawaii' = 'HI', 'Idaho' = 'ID', 'Illinois' = 'IL', 'Indiana' = 'IN', 'Iowa' = 'IA',
  'Kansas' = 'KS', 'Kentucky' = 'KY', 'Louisiana' = 'LA', 'Maine' = 'ME', 'Maryland' = 'MD',
  'Massachusetts' = 'MA', 'Michigan' = 'MI', 'Minnesota' = 'MN', 'Mississippi' = 'MS',
  'Missouri' = 'MO', 'Montana' = 'MT', 'Nebraska' = 'NE', 'Nevada' = 'NV', 'New Hampshire' = 'NH',
  'New Jersey' = 'NJ', 'New Mexico' = 'NM', 'New York' = 'NY', 'North Carolina' = 'NC',
  'North Dakota' = 'ND', 'Ohio' = 'OH', 'Oklahoma' = 'OK', 'Oregon' = 'OR', 'Pennsylvania' = 'PA',
  'Rhode Island' = 'RI', 'South Carolina' = 'SC', 'South Dakota' = 'SD', 'Tennessee' = 'TN',
  'Texas' = 'TX', 'Utah' = 'UT', 'Vermont' = 'VT', 'Virginia' = 'VA', 'Washington' = 'WA',
  'West Virginia' = 'WV', 'Wisconsin' = 'WI', 'Wyoming' = 'WY'
)
df$State <- sapply(df$State, function(x) state_abbreviations[x])
df <- na.omit(df)


states_data <- read_csv("lat-lon-by-state.csv")
df <- left_join(df, states_data, by = "State")


#Save as a pdf
write.csv(df, "df_growth.csv", row.names = FALSE)
